
const customerRoute = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const customersDB = require('../models/customers')
const phoneDB = require('../models/phones')



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


customerRoute.get('/customers/:id', customerVerifyToken, async (request, response, next)=>{

    try{

        if(request.params.id != request.customerID)
        {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized access to this data'
            })
        }

        const customerResult = await customersDB.getCustomerDataWithPhoneByID(request.customerID)

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



})











module.exports = customerRoute