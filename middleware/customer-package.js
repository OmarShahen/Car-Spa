
const customerPackageDB = require('../models/customer-packages')
const doneOrdersDB = require('../models/done-orders')
const packageDB = require('../models/packages')
const serviceDB = require('../models/services')

const checkCustomerPackage = async (request, response, next) => {

    try {

        
        const customerPackage = await customerPackageDB.getCustomerActivePackage(request.customerID)

        if(customerPackage.length != 0) {

            // Check if order creation date passed customer package expiration date

            const momentDate = new Date()

            if(momentDate.getTime() > customerPackage[0].expirationdate.getTime()) {
                
                console.log('Check if order creation date passed customer package expiration date')

                const expirePackage = await customerPackageDB.expireCustomerPackage(customerPackage[0].id)
                const serviceData = await serviceDB.getServiceByID(request.body.orderServiceID)
                request.body.servicePrice = serviceData[0].price
                request.body.orderServiceID = serviceData[0].id

                return next()
                
            }

            // Check if order booking time is after customer package expiration date

            const orderDate = new Date(request.body.bookDate)
            
            if(orderDate.getTime() >= customerPackage[0].expirationdate.getTime()) {

                console.log('Check if order booking time is after customer package expiration date')
                const serviceData = await serviceDB.getServiceByID(request.body.orderServiceID)
                request.body.servicePrice = serviceData[0].price
                request.body.orderServiceID = serviceData[0].id

                return next()
            }

            // Check if customer used all packages number of available washes

            const customerOrders = await doneOrdersDB.getCustomerOrdersFromDates(
                request.customerID,
                customerPackage[0].registrationdate,
                customerPackage[0].expirationdate
            )

            const packageData = await packageDB.getPackage(customerPackage[0].packageid)

            if(customerOrders.length == packageData[0].noofwashes) {

                console.log('Check if customer used all packages number of available washes')

                const expirePackage = await customerPackageDB.expireCustomerPackage(customerPackage[0].id)
                const serviceData = await serviceDB.getServiceByID(request.body.orderServiceID)
                request.body.servicePrice = serviceData[0].price
                request.body.orderServiceID = serviceData[0].id

                return next()

            }    

            console.log('Passed successfully')
            console.log(packageData)
            request.body.serviceID = packageData[0].serviceid
            request.body.servicePrice = (Number(packageData[0].price) / Number(packageData[0].noofwashes)).toFixed(2)

            return next()

        } else {

            console.log('nothing happened')
            const serviceData = await serviceDB.getServiceByID(request.body.orderServiceID)
            request.body.servicePrice = serviceData[0].price
            request.body.orderServiceID = serviceData[0].id

            return next()
        }

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
}

const socketCheckCustomerPackage = async orderData => {

    const customerPackage = await customerPackageDB.getCustomerActivePackage(orderData.customerID)

    if(customerPackage.length != 0) {

        // Check if order creation date passed customer package expiration date

        const momentDate = new Date()

        if(momentDate.getTime() > customerPackage[0].expirationdate.getTime()) {
            
            const expirePackage = await customerPackageDB.expireCustomerPackage(customerPackage[0].id)
            const serviceData = await serviceDB.getServiceByID(orderData.orderServiceID)

            orderData.servicePrice = serviceData[0].price
            orderData.serviceID = serviceData[0].id

            return orderData
            
        }

        // Check if order booking time is after customer package expiration date

        const orderDate = new Date(orderData.bookDate)
        
        if(orderDate.getTime() >= customerPackage[0].expirationdate.getTime()) {

            const serviceData = await serviceDB.getServiceByID(orderData.orderServiceID)
            orderData.servicePrice = serviceData[0].price
            orderData.serviceID = serviceData[0].id
            return orderData
        }

        // Check if customer used all packages number of available washes

        const customerOrders = await doneOrdersDB.getCustomerOrdersFromDates(
        orderData.customerID,
        customerPackage[0].registrationdate,
        customerPackage[0].expirationdate
        )

        const packageData = await packageDB.getPackage(customerPackage[0].packageid)

        if(customerOrders.length == packageData[0].noofwashes) {

            const expirePackage = await customerPackageDB.expireCustomerPackage(customerPackage[0].id)
            const serviceData = await serviceDB.getServiceByID(orderData.orderServiceID)
            orderData.servicePrice = serviceData[0].price
            orderData.serviceID = serviceData[0].id
            return orderData

        }    

        orderData.serviceID = packageData[0].serviceid
        orderData.servicePrice = (Number(packageData[0].price) / Number(packageData[0].noofwashes)).toFixed(2)
        return orderData

    } else {
        const serviceData = await serviceDB.getServiceByID(orderData.serviceID)
        orderData.servicePrice = serviceData[0].price
        orderData.serviceID = serviceData[0].id
    }

    return orderData

}

module.exports = {
    checkCustomerPackage,
    socketCheckCustomerPackage
}