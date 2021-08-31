
const config = require('../config/config')
const customerToken = require('jsonwebtoken')
const customerDB = require('../models/customers')
const orderDB = require('../models/orders')
const employeeDB = require('../models/employees')
const bookingTimeDB = require('../models/booking-times')
const employees = require('../models/employees')


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


module.exports = (io)=>{

    const orderNSP = io.of('/book-now/book-order')
    orderNSP.on('connection', (socket)=>{

        socket.on('book-now', async (orderData)=>{
            try{


            if(!orderData.accessToken)
            {
                return socket.emit('book-now', {
                    accepted: false,
                    message: 'no token provided'
                })
            }
            
            const customerToken = await isValidToken(orderData.accessToken)
            if(!customerToken)
            {
                return socket.emit('book-now', {
                    accepted: false,
                    message: 'this token is invalid'
                })
            }

            const customerData = await customerDB.getCustomerByID(customerToken.customerID)
            if(customerData.length == 0)
            {
                return socket.emit('book-now', {
                    accepted: false,
                    message: 'This user does not exist'
                })
            }

            const ordersAtThatTime = await orderDB.getOrderByDateAndTime(orderData.bookDate, orderData.bookTime)
            const noOfEmloyees = await employeeDB.getNumberOfEmployees()

            // If no employee available
            if(ordersAtThatTime.length == noOfEmloyees[0].count)
            {
                return socket.emit('book-now', {
                    accepted: false,
                    message: 'all drivers are booked at this time'
                })
            }

            // If 1 employee available
            if(ordersAtThatTime.length == (noOfEmloyees[0].count - 1))
            {
                console.log('If One employee available')
                let employeesIDs = []
                for(let i=0;i<ordersAtThatTime.length;i++)
                {
                    employeesIDs.push(ordersAtThatTime[i].employeeid)
                }

                const missingEmployee = await employeeDB.getMissingEmployee(addSS(employeesIDs), employeesIDs)
                const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)
                const assignOrder = await orderDB.addOrder(
                    customerToken.customerID,
                    missingEmployee[0].id,
                    orderData.bookDate,
                    bookTime[0].id,
                    orderData.serviceID
                )

                if(assignOrder)
                {
                    const orderDetails = await orderDB.getOrderByMainData(
                        customerToken.customerID,
                        missingEmployee[0].id,
                        orderData.bookDate,
                        bookTime[0].id
                    )

                    return socket.emit('book-now', {
                        accepted: true,
                        message: 'your wash is booked successfully',
                        orderData: orderDetails
                    })
                }
            }

            // If all employees are available

            /*
                In orderDB.getNoOfOrdersForEachEmployeeByDate(orderData.bookDate)
                it returns only the employees with orders any other employee will
                be undeifned which causes errors in the app
            */
            if(ordersAtThatTime.length == 0)
            {
                console.log('If all employees are available')
                const employeesOrders = await employeesOrdersByDate(orderData.bookDate)

                // If all with equal orders
                const lowestEmployees = getLeast(employeesOrders)
                if(lowestEmployees.length > 1)
                {
                    let employeesIDs = []
                    for(let i=0;i<lowestEmployees.length;i++)
                    {
                        employeesIDs.push(lowestEmployees[i].employeeid)
                    }
                    const employeeRating = await orderDB.getAvgerageRatingForEachEmployee(addSS(employeesIDs), employeesIDs)
                    const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)
                    const assignOrder = await orderDB.addOrder(
                        customerToken.customerID,
                        employeeRating[0].employeeid,
                        orderData.bookDate,
                        bookTime[0].id,
                        orderData.serviceID
                    )

                    if(assignOrder)
                    {
                        const orderDetails = await orderDB.getOrderByMainData(
                            customerToken.customerID,
                            employeeRating[0].employeeid,
                            orderData.bookDate,
                            bookTime[0].id
                        )

                        return socket.emit('book-now', {
                            accepted: true,
                            message: 'you booked your wash successfully',
                            orderData: orderDetails
                        })
                    }
                }

                // If there is employees with zero orders at this day
                if(employeesOrders.length > 0)
                {
                    console.log('If theres is employees with zero orders on this day')
                    let employeesIDs = []
                    for(let i=0;i<employeesOrders.length;i++)
                    {
                        employeesIDs.push(employeesOrders[i].employeeid)
                    }

                    const missingEmployees = await employeeDB.getMissingEmployee(addSS(employeesIDs), employeesIDs)
                    let missingEmployeesIDs = []
                    for(let i=0;i<missingEmployees.length;i++)
                    {
                        missingEmployeesIDs.push(missingEmployees[i].id)
                    }
                    const averageOrders = await orderDB.getAvgerageRatingForEachEmployee(addSS(missingEmployeesIDs), missingEmployeesIDs)
                    const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)                    
                    const assignOrder = await orderDB.addOrder(
                        customerToken.customerID,
                        averageOrders[0].employeeid,
                        orderData.bookDate,
                        bookTime[0].id,
                        orderData.serviceID
                    )

                    if(assignOrder)
                    {
                        const orderDetails = await orderDB.getOrderByMainData(
                            customerToken.customerID,
                            averageOrders[0].employeeid,
                            orderData.bookDate,
                            bookTime[0].id
                        )

                        return socket.emit('book-now', {
                            accepted: true,
                            message: 'your wash is booked successfully',
                            orderData: orderDetails
                        })
                    }

                }

                // If all employees with zero orders at this day
                /**
                 * Here I will apply the criteria by using the average rating
                 * of all employees
                 */
                if(employeesOrders.length == 0)
                {
                    console.log('If all employees with zero orders at this day')
                    const activeEmployees = await employeeDB.getActiveEmployees()
                    if(activeEmployees.length == 0)
                    {
                        return socket.emit('book-now', {
                            accepted: false,
                            message: 'There is no drivers available'
                        })
                    }
                    
                    let activeEmployeesIDs = []
                    for(let i=0;i<activeEmployees.length;i++)
                    {
                        activeEmployeesIDs.push(activeEmployees[i].id)
                    }

                    const employeesRating = await orderDB.getAvgerageRatingForEachEmployee(addSS(activeEmployeesIDs), activeEmployeesIDs)
                    const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)                    
                    const assignOrder = await orderDB.addOrder(
                        customerToken.customerID,
                        employeesRating[0].employeeid,
                        orderData.bookDate,
                        bookTime[0].id,
                        orderData.serviceID
                    )

                    if(assignOrder)
                    {
                        const orderDetails = await orderDB.getOrderByMainData(
                            customerToken.customerID,
                            employeesRating[0].employeeid,
                            orderData.bookDate,
                            bookTime[0].id
                        )

                        return socket.emit('book-now', {
                            accepted: true,
                            message: 'you booked your wash successfully',
                            orderData: orderDetails
                        })
                    }



                }


            }


            // If morethan 1 employee available
            if((noOfEmloyees[0].count - ordersAtThatTime.length) > 1)
            {
                const employeesIDs = collectEmployeesIDsFromOrders(ordersAtThatTime)
                const missingEmployees = await employeeDB.getMissingEmployee(addSS(employeesIDs), employeesIDs)
                const missingEmployeesIDs = collectEmployeesIDs(missingEmployees)
                const employeesOrdersCount = await thoseEmployeesOrdersByDate(missingEmployeesIDs, orderData.bookDate)
                const lowestEmployee = getLeast(employeesOrdersCount)
                const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)
                if(lowestEmployee.length == 1)
                {
                    const assignOrder = await orderDB.addOrder(
                        customerToken.customerID,
                        lowestEmployee[0].employeeid,
                        orderData.bookDate,
                        bookTime[0].id,
                        orderData.serviceID
                    )

                    if(assignOrder)
                    {
                        const orderDetails = await orderDB.getOrderByMainData(
                            customerToken.customerID,
                            lowestEmployee[0].employeeid,
                            orderData.bookDate,
                            bookTime[0].id
                        )

                        return socket.emit('book-now', {
                            accepted: true,
                            message: 'Your wash is booked successfully',
                            orderData: orderDetails
                        })
                    }
                }

                if(lowestEmployee.length > 1)
                {   
                    const employeesIDs = collectEmployeesIDsFromOrders(lowestEmployee)
                    const employeesAverage = await orderDB.getAvgerageRatingForEachEmployee(addSS(employeesIDs), employeesIDs)
                    const bookTime = await bookingTimeDB.getTimeIDByTime(orderData.bookTime)
                    const assignOrder = await orderDB.addOrder(
                        customerToken.customerID,
                        employeesAverage[0].employeeid,
                        orderData.bookDate,
                        bookTime[0].id,
                        orderData.serviceID
                    )

                    if(assignOrder)
                    {
                        const orderDetails = await orderDB.getOrderByMainData(
                            customerToken.customerID,
                            employeesAverage[0].employeeid,
                            orderData.bookDate,
                            bookTime[0].id
                        )

                        return socket.emit('book-now', {
                            accepted: true,
                            message: 'you booked your wash successfully',
                            orderData: orderDetails
                        })
                    }
                }

            }
            

        }catch(error)
        {
            console.log(error)
            socket.emit('book-now', {
                accepted: false,
                message: 'internal server error'
            })
        }

            })




        })
    }