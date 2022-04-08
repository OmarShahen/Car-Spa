
const employeeRouter = require('express').Router()
const { response } = require('express')
const { employeeVerifyToken } = require('../middleware/authority')
const orderDB = require('../models/orders')
const doneOrderDB = require('../models/done-orders')

employeeRouter.get('/employees/orders/today', employeeVerifyToken, async (request, response) => {

    try {

        const todayDate = new Date()
        const todayDateFormatted = `${todayDate.getFullYear()}-${todayDate.getMonth()+1}-${todayDate.getDate()}`
        const employeeOrders = await orderDB.getEmployeeOrdersByDate(request.employeeID, todayDateFormatted)
        
        return response.status(200).send({
            accepted: true,
            ordersData: employeeOrders
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

employeeRouter.get('/employees/orders/later', employeeVerifyToken, async (request, response) => {

    try {

        const todayDate = new Date()
        const todayDateFormatted = `${todayDate.getFullYear()}-${todayDate.getMonth()+1}-${todayDate.getDate()}`
        const employeeOrders = await orderDB.getEmployeeOrdersAfterDate(request.employeeID, todayDateFormatted)

        return response.status(200).send({
            accepted: true,
            ordersData: employeeOrders
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

employeeRouter.get('/employees/orders/done', employeeVerifyToken, async (request, response) => {

    try {

        const doneOrders = await doneOrderDB.getEmployeeDoneOrders(request.employeeID)

        return response.status(200).send({
            accepted: true,
            ordersData: doneOrders
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

employeeRouter.get('/employees/orders/:id', employeeVerifyToken, async (request, response) => {

    try {

        if(!request.params.id) {
            return response.status(306).send({
                accepted: false,
                message: 'order id required'
            }) 
        }

        const orderData = await orderDB.getOrderDataByID(request.params.id)

        if(orderData.length == 0) {
            return response.status(200).send({
                accepted: true,
                order: []
            })
        }

        if(orderData[0].employeeid != request.employeeID) {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized access'
            }) 
        }

        return response.status(200).send({
            accepted: true,
            order: orderData
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

employeeRouter.get('/employees/done-orders/:id', employeeVerifyToken, async (request, response) => {

    try {

        if(!request.params.id) {
            return response.status(306).send({
                accepted: false,
                message: 'order id required'
            }) 
        }

        const orderData = await doneOrderDB.getDoneOrderData(request.params.id)

        if(orderData.length == 0) {
            return response.status(200).send({
                accepted: true,
                order: []
            }) 
        }

        if(orderData[0].employeeid != request.employeeID) {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized access'
            }) 
        }

        return response.status(200).send({
            accepted: true,
            order: orderData
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})



module.exports = employeeRouter