
const orderRoute = require('express').Router()
const { request } = require('express')
const { customerVerifyToken } = require('../middleware/authority')
const reservedDayDB = require('../models/reserved-days')
const bookingTimeDB = require('../models/booking-times')
const employeeDB = require('../models/employees')
const orderDB = require('../models/orders')
const { param } = require('./admins')
const moment = require('moment')



const formateTime = (dateObj)=>{
    return dateObj.getHours().toString() + ':' +dateObj.getMinutes().toString() + ':' + dateObj.getSeconds().toString()
}

const formateDate = (dateObj)=>{
    return dateObj.getFullYear().toString() + '-' + (dateObj.getMonth()+1).toString() + '-' + dateObj.getDate().toString()
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
const addSS = (lst)=>{

    let ss = ''
    for(let i=1;i<=lst.length;i++)
    {
        ss += '$' + i + ','
    }


    return ss.slice(0, ss.length-1)
}

const withinDeadLine = (creationDate, expirationDays=30, inputDate)=>{
    /*
        creationDate & inputDate is Date() instance
        expirationDays is int type
    */

    const creationDateTime = creationDate.getTime()
    const expirationTime = new Date(moment(creationDate).add({days: expirationDays})).getTime()

    if(creationDateTime > inputDate.getTime())
    {
        return {
            accepted: false,
            message: 'This date is already passed'
        }
    }

    if(expirationTime < inputDate.getTime())
    {
        return {
            accepted: false,
            message: 'This date is too far'
        }
    }
    
    return {
        accepted: true,
        message: 'valid date'
    }

}

const employeeOrderChooser = async (orderDate)=>{

    try{

        const ordersData = await orderDB.getNoOfOrdersForEachEmployeeByDate(orderDate)

        if(ordersData.length == 1)
        {
            return ordersData
        }

        const employeesCount = []
        for(let i=0;i<ordersData.length;i++)
        {
            employeesCount.push(ordersData[i])
        }

        return getLowestNumber(employeesCount)

        
    }
    catch(error)
    {
        console.log(error)
    }
}

orderRoute.get('/orders/check-day/:day', customerVerifyToken, async (request, response)=>{

    try{

        console.log(request.params.day)
        console.log(new Date())
        const isWithInDeadLine = withinDeadLine(new Date(), 30, new Date(request.params.day))
        if(!isWithInDeadLine.accepted)
        {
            return response.status(406).send(isWithInDeadLine)
        }

        const checkDay = await reservedDayDB.getDay(new Date(request.params.day.split('-').join('/')))
        if(checkDay.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'there is no service on this day'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'there is service on this day'
        })

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})


orderRoute.get('/orders/book-later/available-times', customerVerifyToken, async (request, response)=>{
    try{

        const availableTimes = await bookingTimeDB.getAvailableTimes()
        return response.status(200).send({
            accepted: true,
            availableTimes: availableTimes
        })
    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})


orderRoute.post('/orders/book-later/book-order/:bookDate/:bookTime', customerVerifyToken, async (request, response)=>{

    try{

        const noOfEmployees = await employeeDB.getNumberOfEmployees()
        const orderTimes = await orderDB.getOrderByDateAndTime(request.params.bookDate, request.params.bookTime)

        // If no employee available
        if(noOfEmployees[0].count == orderTimes.length)
        {
            return response.status(406).send({
                accepted: false,
                message: 'all drivers are booked at this time'
            })
        }

        // If 1 employee left at this time
        if(orderTimes.length == (noOfEmployees[0].count - 1))
        {
            const employeesIDs = []
            for(let i=0;i<orderTimes.length;i++)
            {
                employeesIDs.push(orderTimes[i].employeeid)
            }
            const employeeAssign = await employeeDB.getMissingEmployee(addSS(employeesIDs), employeesIDs)
            const bookingTime = await bookingTimeDB.getTimeIDByTime(request.params.bookTime)
            const assignOrder = await orderDB.addOrder(
                request.customerID,
                employeeAssign[0].id,
                request.params.bookDate,
                bookingTime[0].id,
                request.body.orderServiceID
            )

            // If order registered successfully
            if(assignOrder)
            {
                const orderData = await orderDB.getOrderByMainData(
                    request.customerID,
                    employeeAssign[0].id,
                    request.params.bookDate,
                    bookingTime[0].id
                )

                return response.status(200).send({
                    accepted: true,
                    orderData: orderData[0]
                })
            }


            
        }

        // If all employees are available
        if(orderTimes.length == 0)
        {
            const employeesOrder = await orderDB.getTotalOrdersFromLastEmployeeAccount()
            const lowestEmployee = getLowestNumber(employeesOrder)
            if(lowestEmployee.length ==  1)
            {
                const bookingTime = await bookingTimeDB.getTimeIDByTime(request.params.bookTime)
                const assignOrder = await orderDB.addOrder(
                    request.customerID,
                    lowestEmployee[0].employeeid,
                    request.params.bookDate,
                    bookingTime[0].id,
                    request.body.orderServiceID
                )

                if(assignOrder)
                {
                    const orderData = await orderDB.getOrderByMainData(
                        request.customerID,
                        lowestEmployee[0].employeeid,
                        request.params.bookDate,
                        bookingTime[0].id
                    )

                    return response.status(200).send({
                        accepted: true,
                        orderData: orderData[0]
                    })
                }
            }

            // If morethan 1
            const employeesIDs = []
            for(let i=0;i<lowestEmployee.length;i++)
            {
                employeesIDs.push(lowestEmployee[i].employeeid)
            }
            
            const employeesRating = await orderDB.getAvgerageRatingForEachEmployee(addSS(employeesIDs), employeesIDs)
            const bookingTime = await bookingTimeDB.getTimeIDByTime(request.params.bookTime)
            const assignOrder = await orderDB.addOrder(
                request.customerID,
                employeesRating[0].employeeid,
                request.params.bookDate,
                bookingTime[0].id,
                request.body.orderServiceID
            )

            if(assignOrder)
            {
                const orderData = await orderDB.getOrderByMainData(
                    request.customerID,
                    employeesRating[0].employeeid,
                    request.params.bookDate,
                    bookingTime[0].id
                )

                return response.status(200).send({
                    accepted: true,
                    orderData: orderData[0]
                })
            }
            

        }

        // If morethan 1 employee available
        const employeesIDs = []
        for(let i=0;i<orderTimes.length;i++)
        {
            employeesIDs.push(orderTimes[i].employeeid)
        }

        const missingEmployees = await employeeDB.getMissingEmployee(addSS(employeesIDs), employeesIDs)
        const missingEmployeesIDs = []
        for(let i=0;i<missingEmployees.length;i++)
        {
            missingEmployeesIDs.push(missingEmployees[i].id)
        }

        const employeesTotalOrders = await orderDB.getNoOfOrdersForEmployees(addSS(missingEmployeesIDs), missingEmployeesIDs)
        const lowestEmployeeesOrders = getLowestNumber(employeesTotalOrders)
        const bookingTime = await bookingTimeDB.getTimeIDByTime(request.params.bookTime)
        if(lowestEmployeeesOrders.length == 1)
        {
            const assignOrder = await orderDB.addOrder(
                request.customerID,
                lowestEmployeeesOrders[0].employeeid,
                request.params.bookDate,
                bookingTime[0].id,
                request.body.orderServiceID
            )

            if(assignOrder)
            {
                const orderData = await orderDB.getOrderByMainData(
                    request.customerID,
                    lowestEmployeeesOrders[0].employeeid,
                    request.params.bookDate,
                    bookingTime[0].id
                )

                return response.status(200).send({
                    accepted: true,
                    orderData: orderData[0]
                })
            }
        }

        const lowestEmployeesIDs = []
        for(let i=0;i<lowestEmployeeesOrders.length;i++)
        {
            lowestEmployeesIDs.push(lowestEmployeeesOrders[i].employeeid)
        }
        
        const employeesRating = await orderDB.getAvgerageRatingForEachEmployee(addSS(lowestEmployeesIDs), lowestEmployeesIDs)
        const assignOrder = await orderDB.addOrder(
            request.customerID,
            employeesRating[0].employeeid,
            request.params.bookDate,
            bookingTime[0].id,
            request.body.orderServiceID
        )

        if(assignOrder)
        {
            const orderData = await orderDB.getOrderByMainData(
                request.customerID,
                employeesRating[0].employeeid,
                request.params.bookDate,
                bookingTime[0].id
            )

            return response.status(200).send({
                accepted: true,
                orderData: orderData[0]
            })
        }






        return response.status(200).send({
            accepted: true,
            message: 'Done'
        })
        

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})





orderRoute.get('/orders/book-now/available-times', customerVerifyToken, async (request, response)=>{

    try{

        const currentMomentDate = new Date()
        const correctDate = currentMomentDate.getHours() + ':00:00'
        const availableTimes = await bookingTimeDB.getAvailableTimesFromHour(correctDate)
        const availableTimesChecked = []
        // If 8:30 don't display 9:00 
        if(currentMomentDate.getMinutes() >= 30)
        {
            for(let i=1;i<availableTimes.length;i++)
            {
                availableTimesChecked.push(availableTimes[i])
            }

            return response.status(200).send({
                accepted: true,
                availableTimes: availableTimesChecked
            })
        }
        return response.status(200).send({
            accepted: true,
            availableTimes: availableTimes
        })

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})


orderRoute.post('/orders/book-now/assign-employee/:bookTime', async (request, response)=>{
    
    try{

        const nowDate = new Date()
        const formalDate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate()

        const countEmployees = await employeeDB.getNumberOfEmployees()
        const noOfEmployees = countEmployees[0].count
        
        const ordersOnThisPeriod = await orderDB.getOrderByDateAndTime(formalDate, request.params.bookTime)  
        if(ordersOnThisPeriod.length >= noOfEmployees)
        {
            return response.status(406).send({
                accepted: false,
                message: 'all drivers are booked on this time'
            })
        }

        // Apply Criteria Algorithm
        




        return response.status(200).send('Done')
    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})






module.exports = orderRoute