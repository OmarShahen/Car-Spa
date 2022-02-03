
const config = require('../config/config')
const employeeDB = require('../models/employees')
const orderDB = require('../models/orders')
const customerDB = require('../models/customers')
const bookingTimeDB = require('../models/booking-times')
const customerToken = require('jsonwebtoken')
const { socketCheckCustomerPackage } = require('../middleware/customer-package')



const isValidToken = async (token)=>{

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

    const orderNSP = io.of('/beta/book-now')

    orderNSP.on('connection', socket => {
        
        socket.on('book-now', async (orderData) => {

            try {

                if(!orderData.accessToken) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'token must be provided'
                    })
                }

                const checkToken = await isValidToken(orderData.accessToken)

                if(!checkToken) {
                    return socket.emit('error', {
                        accepted: false,
                        message: 'unauthorized access to this data'
                    })
                }

                orderData.customerID = checkToken.customerID

                // Check if customer orderered before

                const customerOrder = await orderDB.getCustomerUpcomingOrders(orderData.customerID)

                if(customerOrder.length != 0) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'you can\'t place more than 1 unfinished order'
                    })
                }

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

                    console.log('In 1 employee available scope')

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

                        return socket.emit('book-now', {
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

                console.log(employeesTotalOrders)
                const lowestTotalOrdersEmployees = getLowestTotalOrders(employeesTotalOrders)

                console.log('separate')
                console.log(lowestTotalOrdersEmployees)

                if(lowestTotalOrdersEmployees.length == 1) {

                    console.log('In Total orders scope')

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

                        return socket.emit('book-now', {
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
                let employeesRating = await orderDB.getAvgerageRatingForEachEmployee(addSS(lowestTotalOrdersEmployeesIDs), lowestTotalOrdersEmployeesIDs)
                employeesRating = fillMissingEmployeesAverageRating(lowestTotalOrdersEmployeesIDs, employeesRating)

                const highestRatingEmployees = getHighestRating(employeesRating)

                console.log('In average rating scope')

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

                    return socket.emit('book-now', {
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
    })

}