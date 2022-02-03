
const packageRouter = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const packageDB = require('../models/packages')
const customerPackageDB = require('../models/customer-packages')

packageRouter.get('/packages', customerVerifyToken, async (request, response) => {

    try {

        const packagesData = await packageDB.getPackages()

        return response.status(200).send({
            accepted: true,
            packages: packagesData
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

packageRouter.get('/packages/customers/:customerID', customerVerifyToken, async (request, response) => {

    try {

        if(request.customerID != request.params.customerID) {

            return response.status(406).send({
                accepted: false,
                message: 'unauthorized access to data'
            })
        }

        const customerRegisteredPackage = await customerPackageDB.getCustomerPackage(request.params.customerID)

        console.log(customerRegisteredPackage)
        return response.status(200).send({
            accepted: true,
            customerPackage: customerRegisteredPackage[0]
        })


    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})


module.exports = packageRouter