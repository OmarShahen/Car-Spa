
const customerPackageDB = require('../models/customer-packages')
const serviceDB = require('../models/services')

const checkCustomerPackage = async (request, response, next) => {

    try {

    
        const customerPackage = await customerPackageDB.getCustomerPackage(request.customerID)

        if(customerPackage.length != 0) {

            request.body.serviceID = customerPackage[0].serviceid
            request.body.servicePrice = (Number(customerPackage[0].price) / Number(customerPackage[0].noofwashes)).toFixed(2)
        } else {

            const serviceData = await serviceDB.getServiceByID(request.body.orderServiceID)
            request.body.servicePrice = serviceData[0].price
            request.body.orderServiceID = serviceData[0].id
        }

        next()

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
}

const socketCheckCustomerPackage = async (orderData) => {

    const customerPackage = await customerPackageDB.getCustomerPackage(orderData.customerID)

    if(customerPackage.length != 0) {

        orderData.serviceID = customerPackage[0].serviceid
        orderData.servicePrice = (Number(customerPackage[0].price) / Number(customerPackage[0].noofwashes)).toFixed(2)
    } else {

        const serviceData = await serviceDB.getServiceByID(orderData.serviceID)
        orderData.servicePrice = serviceData[0].price
        orderData.orderServiceID = serviceData[0].id
    }

    return orderData

}

module.exports = {
    checkCustomerPackage,
    socketCheckCustomerPackage
}