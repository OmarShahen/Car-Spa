
const customerRoute = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const customerDB = require('../models/customers')
const phoneDB = require('../models/phones')
const adminDB = require('../models/admins')
const orderDB = require('../models/orders')
const doneOrderDB = require('../models/done-orders')
const { updateMail } = require('../mails/mailController')
const verify = require('../controllers/verify-input')



const organizeData = (userData)=>{

    let userInfo = {}
    for(let i=0;i<userData.length;i++)
    {
        if(i == 0)
        {
            userInfo['firstName'] = userData[i].firstname
            userInfo['lastName'] = userData[i].lastname
            userInfo['email'] = userData[i].email
            userInfo['accountCreationDate'] = userData[i].accountcreationdate
            userInfo['phoneNumbers'] = []
            userInfo['phoneNumbers'].push(userData[i].phonenumber)
            continue
        }
        userInfo['phoneNumbers'].push(userData[i].phonenumber)

    }
    return userInfo
}

const isUserEmailExist = async (userEmail)=>{

    try{

        const adminResult = await adminDB.getAdminByEmail(userEmail)
        if(adminResult.length != 0)
        {
            return true
        }

        const customerResult = await customerDB.getCustomerByEmail(userEmail)   
        if(customerResult.length != 0)
        {
            return true
        }
        
        return false

    }
    catch(error)
    {
        console.log(error.message)
        return false
    }
}


customerRoute.get('/customers/:id', customerVerifyToken, async (request, response, next)=>{

    try{

        if(request.params.id != request.customerID)
        {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized access to this data'
            })
        }

        const customerResult = await customerDB.getCustomerDataWithPhoneByID(request.customerID)

        return response.status(200).send({
            accepted: true,
            data: organizeData(customerResult)
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


customerRoute.put('/customers/:id', customerVerifyToken, async (request, response, next)=>{

    try{

        if(request.params.id != request.customerID)
        {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized access to this data'
            })
        }

        const alreadyRegistered = await customerDB.getCustmerByID(request.customerID)
        if(alreadyRegistered[0].email == request.body.customerNewEmail)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this is your already registered email'
            })
        }

        const isEmailExist = await isUserEmailExist(request.body.customerNewEmail)
        if(isEmailExist)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email is already taken'
            })
        }

        const checkPhoneValid = await verify.checkPhoneNumber(request.body.customerNewPhoneNumber)
        if(!checkPhoneValid.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: 'invalid phone number'
            })
        }

        const alreadyRegisteredPhone = await phoneDB.getCustomerPhoneNumber(request.customerID)
        if(request.body.customerNewPhoneNumber == alreadyRegisteredPhone[0].phoneNumber)
        {
            return response.status(401).send({
                accepted: false,
                message: 'this is your already registered phone'
            })
        }

        const isPhoneExist = await phoneDB.checkPhoneNumberExist(request.body.customerNewPhoneNumber)
        if(isPhoneExist.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken'
            })
        }

        const updateUser = await customerDB.setCustomersDataByID(request.customerID, request.body.customerNewEmail)
        const updatePhoneNumber = await phoneDB.setCustomerPhoneNumber(request.customerID, alreadyRegisteredPhone[0].phonenumber, request.body.customerNewPhoneNumber)
        const getNewUserData = await customerDB.getCustomerDataWithPhoneByID(alreadyRegistered[0].id)
        /*const sendUpdateMail = await updateMail(request.body.customerNewEmail, alreadyRegistered[0].firstname)
        .catch(error=>{
            return response.status(500).send({
                accepted: true,
                message: 'updated successfully',
                errorMessage: "couldn't send email"
            })
        })*/

        return response.status(200).send({
            accepted: true,
            message: 'updated successfully',
            data: organizeData(getNewUserData)
        })

    }
    catch(error)
    {
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})

customerRoute.get('/customers/orders/past-orders', customerVerifyToken, async (request, response, next)=>{

    try{

        const customerPastOrdres = await doneOrderDB.getDoneOrdersByCustomerID(request.customerID)
        return response.status(200).send({
            accepted: true,
            orders: customerPastOrdres
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

customerRoute.get('/customers/orders/upcoming-orders', customerVerifyToken, async (request, response)=>{

    try{

        const customerUpcomingOrders = await orderDB.getCustomerUpcomingOrders(request.customerID, request.body.todayDate)
        return response.status(200).send({
            accepted: true,
            orders: customerUpcomingOrders
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

customerRoute.get('/customers/orders/current-orders', customerVerifyToken, async (request, response)=>{

    try{

        const currentOrders = await orderDB.getCustomerCurrentOrders(request.customerID, request.body.todayDate)
        return response.status(200).send({
            accepted: true,
            orders: currentOrders
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

customerRoute.get('/customers/previous-locations/:customerID', customerVerifyToken, async (request, response) => {

    try {
         
        if(request.customerID != request.params.customerID) {

            return response.status(406).send({
                accepted: false,
                message: 'unauthorized access to data'
            })
        }

        const customerPrevLocations = await doneOrderDB.getCustomerPreviousLocations(request.params.customerID)

        return response.status(200).send({
            accepted: true,
            previousLocations: customerPrevLocations
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})




module.exports = customerRoute