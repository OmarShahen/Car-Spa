
const packageRouter = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const packageDB = require('../models/packages')
const customerPackageDB = require('../models/customer-packages')
const moment = require('moment')

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

packageRouter.post('/packages/:packageID/customers/:customerID', customerVerifyToken, async (request, response) => {

    try {

        if(request.customerID != request.params.customerID) {

            return response.status(306).send({
                accepted: true,
                message: 'unauthorized access to this data'
            })
        }

        const packages = await packageDB.getPackage(request.params.packageID)

        if(packages.length == 0) {

            return response.status(306).send({
                accepted: false,
                message: 'invalid package ID'
            })
        }

       const customerPackage = await customerPackageDB.getCustomerActivePackage(request.params.customerID)

        if(customerPackage.length != 0) {

            return response.status(306).send({
                accepted: false,
                message: 'already registered to package'
            })
        }

        const registrationmoment = moment()
        const registrationDate = new Date(registrationmoment)
        let expirationDate = ''

       if(packages[0].duration == 'week') {
            expirationDate = new Date(registrationmoment.add({ days: '7' }))
       } else if(packages[0].duration == 'month') {
           expirationDate = new Date(registrationmoment.add({ days: '30' }))
       }

       const registerCustomerPackage = await customerPackageDB.addCustomerPackage(
           request.params.customerID,
           request.params.packageID,
           registrationDate,
           expirationDate
       )

       return response.status(200).send({
           accepted: true,
           message: 'package assigned to customer successfully'
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