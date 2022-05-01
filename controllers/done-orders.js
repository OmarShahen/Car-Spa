const router = require('express').Router()
const doneOrderDB = require('../models/done-orders')
const { customerVerifyToken } = require('../middleware/authority')



router.get('/done-orders/customers/:customerID', customerVerifyToken, async (request, response) => {

    try {

        if(request.customerID != request.params.customerID) {
            return response.status(406).send({
                accepted: false,
                message: 'unauthorized access to data'
            })
        }

        const customerOrders = await doneOrderDB.getDoneOrdersByCustomerID(request.params.customerID)

        return response.status(200).send({
            accepted: true,
            orders: customerOrders
        })

    } catch(error) {
        console.error(error)
        return Response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

module.exports = router