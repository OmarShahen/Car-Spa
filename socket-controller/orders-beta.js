
const config = require('../config/config')
const employeeDB = require('../models/employees')
const orderDB = require('../models/orders')
const customerDB = require('../models/customers')
const bookingTimeDB = require('../models/booking-times')
const doneOrderDB = require('../models/done-orders')
const customerToken = require('jsonwebtoken')
const employeeToken = require('jsonwebtoken')
const { socketCheckCustomerPackage } = require('../middleware/customer-package')



const isCustomerTokenValid = async (token)=>{

    let functionReturn = ''
    customerToken.verify(token, config.customerSecretKey, (error, decoded)=>{
        if(error)
        {
            functionReturn = false
        }
        functionReturn = decoded
    })

    return functionReturn
}

const isEmployeeTokenValid = async (token)=>{

    let functionReturn = ''
    employeeToken.verify(token, config.employeeSecretKey, (error, decoded)=>{
        if(error)
        {
            functionReturn = false
        }
        functionReturn = decoded
    })

    return functionReturn
}


const searchMissingIDs = (employeesIDs, ordersEmployeesIDs) => {

    const IDs = []

    for(let i=0;i<employeesIDs.length;i++) {
        let found = false
        for(let j=0;j<ordersEmployeesIDs.length;j++) {
            if(employeesIDs[i] == ordersEmployeesIDs[j]) {
                found = true
            }
        }

        if(!found)
            IDs.push(employeesIDs[i])
    }

    return IDs
}

const addSS = (lst)=>{

    let ss = ''
    for(let i=1;i<=lst.length;i++)
    {
        ss += '$' + i + ','
    }


    return ss.slice(0, ss.length-1)
}

const getLowestNumber = (ordersCount)=>{

    const lowest = []
    lowest.push(ordersCount[0])
    let min = ordersCount[0].count
    for(let i=1;i<ordersCount.length;i++)
    {
        if(ordersCount[i].count == min)
        {
            lowest.push(ordersCount[i])
        }
    }

    return lowest
}

const getLeast = (orders)=>{

    let least = []
    let min = orders[0].count
    for(let i=0;i<orders.length;i++)
    {
        if(orders[i].count < min)
        {
            min = orders[i].count
            least = []
            least.push(orders[i])
            continue
        }

        if(orders[i].count == min)
        {
            least.push(orders[i])
        }

    }

    return least
}

const collectEmployeesIDs = (employees)=>{
    let IDs = []
    for(let i=0;i<employees.length;i++)
    {
        IDs.push(employees[i].id)
    }
    return IDs
}

const collectEmployeesIDsFromOrders = (orders)=>{
    let IDs = []
    for(let i=0;i<orders.length;i++)
    {
        IDs.push(orders[i].employeeid)
    }
    return IDs
}

const getEmployeesData = (employees, targetIDs) => {

    const targetEmployees = []

    for(let i=0;i<employees.length;i++) {

        for(let j=0;j<targetIDs.length;j++) {
            
            if(employees[i].id == targetIDs[j]) {
                targetEmployees.push(employees[i])
            }
        }
    }

    return targetEmployees
}

const collectEmployeesIDsFromAggregation = (employeesResult) => {

    const IDs = []

    for(let i=0;i<employeesResult.length;i++) {
        IDs.push(employeesResult[i].employeeid)
    }

    return IDs
}

const fillMissingEmployeesTotalOrders = (employeesIDs, employeesResults) => {

    const missingEmployees = searchMissingIDs(employeesIDs, collectEmployeesIDsFromAggregation(employeesResults))

    for(let i=0;i<missingEmployees.length;i++) {

        employeesResults.push({ count: '0', employeeid: missingEmployees[i] })
    }

    return employeesResults
}

const getLowestTotalOrders = (ordersCount)=>{

    let lowest = []
    lowest.push(ordersCount[0])
    let min = ordersCount[0].count
    for(let i=1;i<ordersCount.length;i++)
    {
        if(ordersCount[i].count == min)
        {
            lowest.push(ordersCount[i])
        }

        if(ordersCount[i].count < min) {

            min = ordersCount[i].count
            lowest = [ordersCount[i]]
        }
    }

    return lowest
}


const employeesOrdersByDate = async (orderDate)=>{

    const getEmployees = await employeeDB.getActiveEmployees()
    const getCountOrdersByDate = await orderDB.getNoOfOrdersForEachEmployeeByDate(orderDate)

    const employeesIDs = collectEmployeesIDs(getEmployees)
    const employeesOrdersIDs = collectEmployeesIDsFromOrders(getCountOrdersByDate)

    if(employeesIDs.length == employeesOrdersIDs.length)
    {
        return getCountOrdersByDate
    }

    if(getCountOrdersByDate.length == 0)
    {
        const countOrdersOfEmployees = []
        for(let i=0;i<getEmployees.length;i++)
        {
            countOrdersOfEmployees.push({
                employeeid: employeesIDs[i],
                count: 0
            })
        }

        return countOrdersOfEmployees
    }

    const countOrdersOfEmployees = []
    for(let i=0;i<employeesIDs.length;i++)
    {
        found = false
        for(let j=0;j<employeesOrdersIDs.length;j++)
        {
            if(employeesIDs[i] == employeesOrdersIDs[j])
            {
                countOrdersOfEmployees.push({
                    employeeid: employeesIDs[i],
                    count: Number(getCountOrdersByDate[j].count)
                })
                
                found = true
                break
            }

        }

        if(!found)
        {
            countOrdersOfEmployees.push({
                employeeid: employeesIDs[i],
                count: 0
            })

        }
    }

    return countOrdersOfEmployees

}

const thoseEmployeesOrdersByDate = async (employeesIDs, orderDate)=>{

    const employeesOrderCount = await orderDB.getNoOfOrdersForThoseEmployeesByDate(
        addSS(employeesIDs),
        employeesIDs,
        orderDate,
        '$' + (employeesIDs.length + 1)
        )

        if(employeesIDs.length == employeesOrderCount.length)
        {
            return employeesOrderCount
        }

        if(employeesOrderCount.length == 0)
        {
            const employeesOrders = []
            for(let i=0;i<employeesIDs.length;i++)
            {
                employeesOrders.push({
                    employeeid: employeesIDs[i],
                    count: 0
                })
            }
            
            return employeesOrders
        }

        const countOrdersOfEmployees = []
        for(let i=0;i<employeesIDs.length;i++)
        {
            found = false
            for(let j=0;j<employeesOrderCount.length;j++)
            {
                if(employeesIDs[i] == employeesOrderCount[j].employeeid)
                {
                    countOrdersOfEmployees.push({
                        employeeid: employeesIDs[i],
                        count: Number(employeesOrderCount[j].count)
                    })

                    found = true
                    break
                }
            }

            if(!found)
            {
                countOrdersOfEmployees.push({
                    employeeid: employeesIDs[i],
                    count: 0
                })
            }
        }


        return countOrdersOfEmployees

}

const fillMissingEmployeesAverageRating = (employeesIDs, employeesResults) => {

    const missingEmployees = searchMissingIDs(employeesIDs, collectEmployeesIDsFromAggregation(employeesResults))

    for(let i=0;i<missingEmployees.length;i++) {

        employeesResults.push({ avg: 0, employeeid: missingEmployees[i] })
    }

    return employeesResults
}

const getHighestRating = (ordersRating) => {

    const highest = []
    highest.push(ordersRating[0])
    let max = ordersRating[0].avg
    for(let i=1;i<ordersRating.length;i++) {

        if(ordersRating[i].avg == max) {
            highest.push(ordersRating[i])
        }
    }

    return highest
}



module.exports = (io) => {


    io.of('/orders').on('connection', socket => {
        console.log('connected in orders namespace')
        
        socket.on('book:now', async (orderData) => {

            try {

                if(!orderData.accessToken) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'token must be provided'
                    })
                }

                const checkToken = await isCustomerTokenValid(orderData.accessToken)

                if(!checkToken) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'unauthorized access to this data'
                    })
                }

                orderData.customerID = checkToken.customerID

                // Check if customer orderered before

                /*const customerOrder = await orderDB.getCustomerUpcomingOrders(orderData.customerID)

                if(customerOrder.length != 0) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'you can\'t place more than 1 unfinished order'
                    })
                }*/

                // Check if time is available 

                const dateNow = new Date()
                let orderDate = `${dateNow.getFullYear()}-${dateNow.getMonth()+1}-${dateNow.getDate()}`
                let timeNow = `${ dateNow.getHours() }:00:00`

                if(dateNow.getMinutes() > 30) {
                    timeNow = `${ dateNow.getHours() + 1 }:00:00`
                }

                const orderTime = await bookingTimeDB.getAvailableTimeByTime(timeNow)
                
                if(!orderTime[0].available) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'this time is not available'
                    })
                }

                orderData = await socketCheckCustomerPackage(orderData)

                // orderDate = '2021-10-09'
                // timeNow = '9:00:00'

                const orders = await orderDB.getOrderByDateAndTime(orderDate, timeNow)
                const employees = await employeeDB.getWorkingEmployees()
                const bookingTime = await bookingTimeDB.getTimeIDByTime(timeNow)

                // If there is no available employee

                if(orders.length == employees.length) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'no employee available'
                    })
                }

                const ordersEmployeesIDs = collectEmployeesIDsFromOrders(orders)
                const employeesIDs = collectEmployeesIDs(employees)

                // If there is 1 employee available

                if((employees.length - orders.length) == 1) {

                    const missingEmployee = searchMissingIDs(employeesIDs, ordersEmployeesIDs)

                    const assignOrder = await orderDB.addOrder(
                        orderData.customerID,
                        missingEmployee[0],
                        orderDate,
                        bookingTime[0].id,
                        orderData.serviceID,
                        new Date(),
                        orderData.locationName,
                        orderData.longitude,
                        orderData.latitude,
                        orderData.servicePrice
                    )

                    if(assignOrder) {

                        const assignedOrderData = await orderDB.getOrderByMainData(
                            orderData.customerID,
                            missingEmployee[0],
                            orderDate,
                            bookingTime[0].id
                        )

                        socket.emit('book:now', {
                            accepted: true,
                            orderData: assignedOrderData[0]
                        })

                        return socket.to(`${ missingEmployee[0] }`).emit('book:now', {
                            accepted: true,
                            orderData: assignedOrderData[0]
                        })
                    }
                }

                
            /**
             * Tf there is more than 1 employee available
             * the program will search for the lowest employee 
             * order wise 
             */
                
                const targetEmployeesIDs = searchMissingIDs(employeesIDs, ordersEmployeesIDs)
                const targetEmployees = getEmployeesData(employees, targetEmployeesIDs)
                //const searchDate = getNearestDate(targetEmployees)

                let employeesTotalOrders = await orderDB.getNoOfOrdersForThoseEmployeesByDate(
                    targetEmployeesIDs,
                    addSS(targetEmployeesIDs),
                    orderDate,
                    '$' + (targetEmployeesIDs.length + 1)
                )

                employeesTotalOrders = fillMissingEmployeesTotalOrders(targetEmployeesIDs, employeesTotalOrders)

                const lowestTotalOrdersEmployees = getLowestTotalOrders(employeesTotalOrders)

                if(lowestTotalOrdersEmployees.length == 1) {

                    const assignOrder = await orderDB.addOrder(
                        orderData.customerID,
                        lowestTotalOrdersEmployees[0].employeeid,
                        orderDate,
                        bookingTime[0].id,
                        orderData.serviceID,
                        new Date(),
                        orderData.locationName,
                        orderData.longitude,
                        orderData.latitude,
                        orderData.servicePrice
                    )

                    if(assignOrder) {
                        
                        const assignedOrderData = await orderDB.getOrderByMainData(
                            orderData.customerID,
                            lowestTotalOrdersEmployees[0].employeeid,
                            orderDate,
                            bookingTime[0].id
                        )

                        socket.emit('book:now', {
                            accepted: true,
                            orderData: assignedOrderData[0]
                        })

                        return socket.to(`${ lowestTotalOrdersEmployees[0].employeeid }`).emit('book:now', {
                            accepted: true,
                            orderData: assignedOrderData[0]
                        })
                    }

                }


                /**
                 * If there is employees with the same number
                 * of lowest orders the program will search for
                 * the highest employee rate wise
                 */

                const lowestTotalOrdersEmployeesIDs = collectEmployeesIDsFromAggregation(lowestTotalOrdersEmployees)
                let employeesRating = await doneOrderDB.getAvgerageRatingForEachEmployee(addSS(lowestTotalOrdersEmployeesIDs), lowestTotalOrdersEmployeesIDs)
                employeesRating = fillMissingEmployeesAverageRating(lowestTotalOrdersEmployeesIDs, employeesRating)

                const highestRatingEmployees = getHighestRating(employeesRating)

                const assignOrder = await orderDB.addOrder(
                    orderData.customerID,
                    highestRatingEmployees[0].employeeid,
                    orderDate,
                    bookingTime[0].id,
                    orderData.serviceID,
                    new Date(),
                    orderData.locationName,
                    orderData.longitude,
                    orderData.latitude,
                    orderData.servicePrice
                )

                if(assignOrder) {

                    const assignedOrderData = await orderDB.getOrderByMainData(
                        orderData.customerID,
                        highestRatingEmployees[0].employeeid,
                        orderDate,
                        bookingTime[0].id
                    )

                    socket.emit('book:now', {
                        accepted: true,
                        orderData: assignedOrderData[0]
                    })

                    return socket.to(`${ highestRatingEmployees[0].employeeid }`).emit('book:now', {
                        accepted: true,
                        orderData: assignedOrderData[0]
                    })
                }

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('order-active', async orderData => {

            const employeeDecodedToken = await isEmployeeTokenValid(orderData.accessToken)

            if(!employeeDecodedToken) {

                return socket.emit('error', {
                    accepted: false,
                    message: 'invalid access to data'
                })
            }

            orderData.employeeID = employeeDecodedToken.employeeID

            const updateOrder = await orderDB.setOrderToActive(orderData.orderID)
            const orderDataFromDB = await orderDB.getOrderByID(orderData.orderID)

            console.log(orderDataFromDB)

            return socket.to(`${ orderDataFromDB[0].customerid }`).emit('order-active', {
                message: 'our driver is on his way to you now'
            })

        })

        socket.on('order-done', async requestData => {

            try {

                const employeeDecodedToken = await isEmployeeTokenValid(requestData.accessToken)

                if(!employeeDecodedToken) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid access to data'
                    })
                }

                requestData.employeeID = employeeDecodedToken.employeeID

                const orderData = await orderDB.getOrderByID(requestData.orderID)

                if(orderData.length == 0) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'this order does not exist'
                    })
                }


                const addDoneOrder = await doneOrderDB.addDoneOrder(
                    orderData[0].customerid,
                    orderData[0].employeeid,
                    orderData[0].orderdate,
                    orderData[0].bookingtimeid,
                    orderData[0].serviceid,
                    orderData[0].ordercreationdate,
                    orderData[0].longitude,
                    orderData[0].latitude,
                    orderData[0].locationname,
                    orderData[0].price
                )

                const deleteOrder = await orderDB.deleteOrderByID(requestData.orderID)

                const doneOrderData = await doneOrderDB.getDoneOrderByCustomerIDandOrderCreationDate(orderData[0].customerid, orderData[0].orderdate)

                return socket.to(`${ orderData[0].customerid }`).emit('order-rate', {
                    accepted: true,
                    message: 'please rate our order',
                    orderData: doneOrderData[0]
                })


            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('order-late', async requestData => {

            try {

                const employeeDecodedToken = await isEmployeeTokenValid(requestData.accessToken)

                if(!employeeDecodedToken) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid access to data'
                    })
                }

                requestData.employeeID = employeeDecodedToken.employeeID

                return socket.to(`${ requestData.customerID }`).emit('order-late', {
                    message: 'our employee might come late'
                })

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('employee-order-cancel', async requestData => {

            try {

                const employeeDecodedToken = await isEmployeeTokenValid(requestData.accessToken)

                if(!employeeDecodedToken) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'unauthorized access to this data'
                    })
                }

                requestData.employeeID = employeeDecodedToken.employeeID

                return socket.to(`${ requestData.customerID }`).emit('employee-order-cancel', {
                    message: 'our driver won\'t be abl to come, please order another wash',
                    orderID: requestData.orderID
                })

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('customer-order-cancel', async requestData => {

            try {

                const checkToken = await isCustomerTokenValid(requestData.accessToken)

                if(!checkToken) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'unauthorized access to this data'
                    })
                }

                requestData.customerID = checkToken.customerID

                return socket.to(`${ requestData.employeeID }`).emit('customer-order-cancel', {
                    message: 'customer cancelled this order',
                    orderID: requestData.orderID
                })


            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('orders:customers:join', async requestData => {

            try {

                if(!requestData.customerID) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'customer ID is required'
                    })
                }


                const customer = await customerDB.getCustomerByID(requestData.customerID)
                
                if(customer.length == 0) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid customer id'
                    })
                }

                return socket.join(customer.id)

            }  catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('orders:employees:join', async requestData => {

            try {

                if(!requestData.employeeID) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'employee ID is required'
                    })
                }

                const employee = await employeeDB.getEmployeeByID(requestData.employeeID)

                if(employee.length ==  0) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'employee ID is invalid'
                    })
                }

                return socket.join(employee.id)

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('orders:start', async requestData => {

            try {

                if(!requestData.orderID) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'internal server error'
                    })
                }

                const order = await orderDB.getOrderByID(requestData.orderID)

                if(order.length == 0) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid order id'
                    })
                }

                const activateOrder = await orderDB.setOrderToActive(order[0].id)
        
                return socket.in(order.customerID).emit('orders:start', {
                    message: 'our employee is on his way',
                    accepted: true
                })

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('orders:late', async requestData => {

            try {

                if(!requestData.orderID) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'order ID is required'
                    })
                }

                const order = await orderDB.getOrderByID(requestData.orderID)

                if(order.length == 0) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid order id'
                    })
                }

                return socket.to(order.customerID).emit('orders:late', {
                    message: 'our employee might be late'
                })

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

        socket.on('orders:confirm', async requestData => {

            try {

                if(!requestData.orderID) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'order ID is required'
                    })
                }

                const order = await orderDB.getOrderByID(requestData.orderID)

                if(order.length == 0) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid order ID'
                    })
                }

                const doneOrderData = {
                    customerid: order[0].customerid,
                    employeeid: order[0].employeeid,
                    orderdate: order[0].orderdate,
                    bookingtimeid: order[0].bookingtimeid,
                    serviceid: order[0].serviceid,
                    ordercreationdate: order[0].ordercreationdate,
                    longitude: order[0].longitude,
                    latitude: order[0].latitude,
                    locationname: order[0].locationname,
                    price: Number(order[0].price),
                    rating: 5
                }   

                const doneOrder = await doneOrderDB.addDoneOrder(doneOrderData)

                //const delOrder = await orderDB.deleteOrderByID(requestData.orderID)

                return socket.to(order.customerid).emit('orders:rate', {
                    message: 'please rate your wash experience'
                })

            } catch(error) {
                console.error(error)
                return socket.emit('error', {
                    accepted: false,
                    message: 'internal server error'
                })
            }
        })

    })

}