
const orderRoute = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const { checkCustomerPackage } = require('../middleware/customer-package') 
const reservedDayDB = require('../models/reserved-days')
const bookingTimeDB = require('../models/booking-times')
const employeeDB = require('../models/employees')
const orderDB = require('../models/orders')
const cancelledOrderDB = require('../models/cancelled-orders')
const doneOrderDB = require('../models/done-orders')
const serviceDB = require('../models/services')
const promocodeDB = require('../models/promocodes')
const usedPromocodeDB = require('../models/promocodesUsed')
const customerPackageDB = require('../models/customer-packages')
const { param } = require('./admins')
const moment = require('moment')
// const order = require('../book-order/order')


const formateTime = (dateObj)=>{
    return dateObj.getHours().toString() + ':' +dateObj.getMinutes().toString() + ':' + dateObj.getSeconds().toString()
}

const formateDate = (dateObj)=>{
    return dateObj.getFullYear().toString() + '-' + (dateObj.getMonth()+1).toString() + '-' + dateObj.getDate().toString()
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


const addSS = (lst)=>{

    let ss = ''
    for(let i=1;i<=lst.length;i++)
    {
        ss += '$' + i + ','
    }


    return ss.slice(0, ss.length-1)
}

const collectEmployeesIDsFromOrders = (orders)=>{
    let IDs = []
    for(let i=0;i<orders.length;i++)
    {
        IDs.push(orders[i].employeeid)
    }
    return IDs
}

const collectEmployeesIDs = (employees)=>{
    let IDs = []
    for(let i=0;i<employees.length;i++)
    {
        IDs.push(Number(employees[i].id))
    }
    return IDs
}

const collectEmployeesIDsFromAggregation = (employeesResult) => {

    const IDs = []

    for(let i=0;i<employeesResult.length;i++) {
        IDs.push(employeesResult[i].employeeid)
    }

    return IDs
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

const getNearestDate = (employees) => {

    let nearestDate = employees[0].accountcreationdate

    for(let i=1;i<employees.length;i++) {
        if(employees[i].accountcreationdate.getTime() > nearestDate.getTime()) {
            nearestDate = employees[i].accountcreationdate
        }
    }

    return nearestDate
}


const fillMissingEmployeesTotalOrders = (employeesIDs, employeesResults) => {

    const missingEmployees = searchMissingIDs(employeesIDs, collectEmployeesIDsFromAggregation(employeesResults))

    for(let i=0;i<missingEmployees.length;i++) {

        employeesResults.push({ count: '0', employeeid: missingEmployees[i] })
    }

    return employeesResults
}

const fillMissingEmployeesAverageRating = (employeesIDs, employeesResults) => {

    const missingEmployees = searchMissingIDs(employeesIDs, collectEmployeesIDsFromAggregation(employeesResults))

    for(let i=0;i<missingEmployees.length;i++) {

        employeesResults.push({ avg: 0, employeeid: missingEmployees[i] })
    }

    return employeesResults
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

orderRoute.post('/orders/check-day/:day', customerVerifyToken, async (request, response)=>{

    try{

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
                request.body.orderServiceID,
                new Date()
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
                    request.body.orderServiceID,
                    new Date()
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
                request.body.orderServiceID,
                new Date()
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
        console.log(employeesTotalOrders)
        const lowestEmployeeesOrders = getLowestNumber(employeesTotalOrders)
        const bookingTime = await bookingTimeDB.getTimeIDByTime(request.params.bookTime)
        if(lowestEmployeeesOrders.length == 1)
        {
            const assignOrder = await orderDB.addOrder(
                request.customerID,
                lowestEmployeeesOrders[0].employeeid,
                request.params.bookDate,
                bookingTime[0].id,
                request.body.orderServiceID,
                new Date()
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
            request.body.orderServiceID,
            new Date()
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

 
orderRoute.post('/beta/orders/book-later/book-order', customerVerifyToken, checkCustomerPackage, async (request, response) => {

    try {

        // Get employees Available at that time

        const orders = await orderDB.getOrderByDateAndTime(request.body.bookDate, request.body.bookTime)
        const employees = await employeeDB.getWorkingEmployees()
        const bookingTime = await bookingTimeDB.getTimeIDByTime(request.body.bookTime)

        // Check if customer ordered before

        /*const customerOrder = await orderDB.getCustomerUpcomingOrders(request.customerID)

        if(customerOrder.length != 0) {

            return response.status(306).send({
                accepted: false,
                message: 'you can\'t place more than 1 unfinished order'
            })
        }*/

        // If there is no available employee

        if(orders.length == employees.length) {
            return response.status(306).send({
                accepted: false,
                message: 'no employee available at that time'
            })
        }

        const ordersEmployeesIDs = collectEmployeesIDsFromOrders(orders)
        const employeesIDs = collectEmployeesIDs(employees)

        // If there is 1 employee available

        if((employees.length - orders.length) == 1) {

            console.log('In 1 employee available scope')

            const missingEmployee = searchMissingIDs(employeesIDs, ordersEmployeesIDs)
            console.log(missingEmployee)

            const assignOrder = await orderDB.addOrder(
                request.customerID,
                missingEmployee[0],
                request.body.bookDate,
                bookingTime[0].id,
                request.body.serviceID,
                new Date(),
                request.body.locationName,
                request.body.longitude,
                request.body.latitude,
                request.body.servicePrice
            )

            if(assignOrder) {

                const orderData = await orderDB.getOrderByMainData(
                    request.customerID,
                    missingEmployee[0],
                    request.body.bookDate,
                    bookingTime[0].id
                )

                return response.status(200).send({
                    accepted: true,
                    orderData: orderData[0]
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
        const searchDate = getNearestDate(targetEmployees)

        let employeesTotalOrders = await doneOrderDB.getNoOfOrdersForThoseEmployeesFromDate(
            targetEmployeesIDs,
            addSS(targetEmployeesIDs),
            `${searchDate.getFullYear()}-${searchDate.getMonth()+1}-${searchDate.getDate()}`,
            '$' + (targetEmployeesIDs.length + 1)
        )

        employeesTotalOrders = fillMissingEmployeesTotalOrders(targetEmployeesIDs, employeesTotalOrders)
        
        const lowestTotalOrdersEmployees = getLowestTotalOrders(employeesTotalOrders)

        if(lowestTotalOrdersEmployees.length == 1) {

            console.log('In Total orders scope')

            const assignOrder = await orderDB.addOrder(
                request.customerID,
                lowestTotalOrdersEmployees[0].employeeid,
                request.body.bookDate,
                bookingTime[0].id,
                request.body.serviceID,
                new Date(),
                request.body.locationName,
                request.body.longitude,
                request.body.latitude,
                request.body.servicePrice
            )

            if(assignOrder) {
                
                const orderData = await orderDB.getOrderByMainData(
                    request.customerID,
                    lowestTotalOrdersEmployees[0].employeeid,
                    request.body.bookDate,
                    bookingTime[0].id
                )

                return response.status(200).send({
                    accepted: true,
                    orderData: orderData[0]
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

        console.log('In average rating scope')

        const assignOrder = await orderDB.addOrder(
            request.customerID,
            highestRatingEmployees[0].employeeid,
            request.body.bookDate,
            bookingTime[0].id,
            request.body.serviceID,
            new Date(),
            request.body.locationName,
            request.body.longitude,
            request.body.latitude,
            request.body.servicePrice
        )

        if(assignOrder) {

            const orderData = await orderDB.getOrderByMainData(
                request.customerID,
                highestRatingEmployees[0].employeeid,
                request.body.bookDate,
                bookingTime[0].id
            )

            return response.status(200).send({
                accepted: true,
                orderData: orderData[0]
            })
        }

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

orderRoute.post('/orders/book-order/available/:bookDate/:bookTime', customerVerifyToken, async (request, response)=>{
    
    try{

        const noOfEmployees = await employeeDB.getNumberOfEmployees()
        const orders = await orderDB.getOrderByDateAndTime(request.params.bookDate, request.params.bookTime)
        
        if(Number(noOfEmployees[0].count) == orders.length)
        {
            return response.status(406).send({
                accepted: false,
                message: 'all drivers are booked at this time'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'this time is available'
        })
    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message:'internal server error'
        })
    }
})
orderRoute.get('/orders/book-now/available-times', customerVerifyToken, async (request, response) => {

    try {

        const timeNow = new Date()
        const hour = `${timeNow.getHours()}:00:00`
        const times = await bookingTimeDB.getAvailableTimesFromHour(hour)

        return response.status(200).send({
            accepted: true,
            availableTimes: times
        })


    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'inetrnal server error'
        })
    }

})

orderRoute.put('/orders/rating/:orderID/:rating', customerVerifyToken, async (request, response) => {

    try {

        const orderData = await orderDB.getOrderByID(request.params.orderID)
        
        if(orderData.length == 0) {

            return response.status(404).send({
                accepted: false,
                message: 'this order does not exist'
            })
        }

        if(request.customerID != orderData[0].customerid) {

            return response.status(406).send({
                accepted: false,
                message: 'unauthorized access to this data'
            })
        }

        const updateOrder = await orderDB.setOrderRating(request.params.orderID, request.params.rating)

        if(!updateOrder) {

            return response.status(406).send({
                accepted: true,
                message: 'order rated successfully'
            })
        }





        return response.status(200).send('I am VIP')


    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: true,
            message: 'internal server error'
        })
    }

})

orderRoute.put('/orders/promocode/:promocodeName', customerVerifyToken, async (request, response) => {

    try {

        const customerPackage = await customerPackageDB.getCustomerPackage(request.customerID)

        if(customerPackage.length != 0) {

            return response.status(200).send({
                accepted: false,
                message: 'already registered in package, can\'t use promocodes'
            })
        }

        const promocodeData = await promocodeDB.getPromocodeByName(request.params.promocodeName)

        if(promocodeData.length == 0) {

            return response.status(406).send({
                accepted: false,
                message: 'invalid promocode'
            })
        }

        const promocodeUsedData = await usedPromocodeDB.getPromocodeUsed(request.params.promocodeName)

        if(promocodeUsedData.length == 1) {

            return response.status(406).send({
                accepted: false,
                message: 'already used promocode'
            })
        }

        const orderData = await orderDB.getOrderPriceByCustomerID(request.customerID)

        if(orderData.length == 0) {

            return response.status(306).send({
                accepted: false,
                message: 'no order registered to discount'
            })
        }
        
        const newPrice = orderData[0].price * (promocodeData[0].percentage / 100)

        const assignPromocode = await usedPromocodeDB.addPromocodeUsed(promocodeData[0].name, request.customerID, orderData[0].id)

        const updatePrice = await orderDB.setOrderPriceByCustomerID(newPrice, request.customerID)


        return response.status(200).send({
            accepted: true,
            message: 'promocode used successfully'
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})

orderRoute.put('/orders/done/rate/:orderID/:rate', customerVerifyToken, async (request, response) => {

    try {

        const doneOrderData = await doneOrderDB.getDoneOrder(request.params.orderID)

        console.log(doneOrderData)
        
        if(doneOrderData.length == 0) {

            return response.status(306).send({
                accepted: false,
                message: 'this ID does not exist'
            })
        }

        if(request.params.rate <= 0 || request.params.rate > 5) {

            return response.status(306).send({
                accepted: false,
                message: 'rate value must be more than 0 and less than 5'
            })
        }

        const rateOrder = await doneOrderDB.rateDoneOrder(request.params.orderID, request.params.rate)

        return response.status(200).send({
            accepted: true,
            message: 'thanks for the rating'
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})

orderRoute.delete('/orders/:orderID', customerVerifyToken, async (request, response) => {

    try {

        const orderData = await orderDB.getOrderByID(request.params.orderID)

        if(orderData.length == 0) {

            return response.status(406).send({
                accepted: false,
                message: 'invalid order ID'
            })
        }

        const addCancelledOrder = await cancelledOrderDB.addCancelledOrder(
            orderData[0].customerid,
            orderData[0].employeeid,
            orderData[0].orderdate,
            orderData[0].bookingtimeid,
            orderData[0].serviceid,
            orderData[0].ordercreationdate,
            new Date(),
            orderData[0].locationname,
            orderData[0].longitude,
            orderData[0].latitude,
            orderData[0].price
        )
        
        const deletePromocodeUsed = await usedPromocodeDB.deletePromocodeUsed(request.params.orderID)

        const deleteOrder = await orderDB.deleteOrderByID(request.params.orderID)

        return response.status(200).send({
            accepted: true,
            cancelledOrderID: request.params.orderID,
            customerID: orderData[0].customerid,
            employeeID: orderData[0].employeeid
        })


    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

orderRoute.get('/orders/cancelled/:customerID', customerVerifyToken, async (request, response) => {

    try {

        const cancelledOrders = await cancelledOrderDB.getCancelledOrdersByCustomerID(request.params.customerID)

        return response.status(200).send({
            accepted: true,
            cancelledOrders: cancelledOrders
        }) 

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})

orderRoute.post('/orders/test-package-middleware', customerVerifyToken, checkCustomerPackage, async (request, response) => {

    try {

        return response.status(200).send('Thank you next')
    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})


module.exports = orderRoute