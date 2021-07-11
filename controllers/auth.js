

const authRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const customerDB = require('../models/customers')
const EmployeeDB = require('../models/employees')
const adminDB = require('../models/admins')
const phoneDB = require('../models/phones')
const verify = require('./verify-input')
const config = require('../config/config')
const bcrypt = require('bcrypt')

const userEmailExist = async (userEmail)=>{

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




authRouter.post('/customers/sign-up', (request, response)=>{

    // Check First Name
    verify.checkName(request.body.customerFirstName)
    .then(data=>{
        if(!data.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: data.message
            })
        }

        // Check Last Name
        verify.checkName(request.body.customerLastName)
        .then(data=>{
            if(!data.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: data.message
                })
            }

            // Check Email
            const checkMail = verify.checkEmail(request.body.customerEmail)
            if(!checkMail.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: checkMail.message
                })
            }

            userEmailExist(request.body.customerEmail)
            .then(result=>{
                if(result)
                {
                    return response.status(406).send({
                        accepted: false,
                        message: 'this email is already taken'
                    })
                }

            // Check Phone Number
            verify.checkPhoneNumber(request.body.customerPhoneNumber)
            .then(result=>{
                if(!result.accepted)
                {
                    return response.status(406).send({
                        accepted: false,
                        message: result.message
                    })
                }

            phoneDB.checkPhoneNumberExist(request.body.customerPhoneNumber)
            .then(result=>{
                if(result.length != 0)
                {
                    return response.status(406).send({
                        accepted: false,
                        message: 'this phone number is already taken'
                    })
                    
                }

            // Check Password
            const checkPassword = verify.checkEmptyInput(request.body.customerPassword)
            if(!checkPassword.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: checkPassword.message
                })
            }

            // Check Confirm Password
            const checkConfirmPassword = verify.checkEmptyInput(request.body.customerConfirmPassword)
            if(!checkConfirmPassword.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: checkConfirmPassword.message
                })
            }

            if(request.body.customerPassword != request.body.customerConfirmPassword)
            {
                return response.status(406).send({
                    accepted: false,
                    message: 'confirm password is not the same as password'
                })
            }

            // Create Clean customer
            jwt.sign({customerEmail: request.body.customerEmail}, config.secretKey, {expiresIn: '30d'},
             (error, result)=>{
                 if(error)
                 {
                    console.log(error.message)
                    return response.status(500).send({
                        accepted: false,
                        message: 'internal server error'
                    })
                 }

                 customerDB.addCustomer(
                     request.body.customerFirstName,
                     request.body.customerLastName,
                     request.body.customerEmail,
                     bcrypt.hashSync(request.body.customerPassword, 8),
                     new Date()
                 )
                 .then(result=>{
                    
                    customerDB.getCustomerByEmail(request.body.customerEmail)
                    .then(customerData=>{                        
                        phoneDB.addCustomerPhoneNumberByID(request.body.customerPhoneNumber, customerData[0].id)
                        .then(result=>{
                            return response.status(200).send({
                                accepted: true,
                                message: 'account created successfully',
                                token: jwt.sign({customerID: customerData.id}, config.secretKey, {expiresIn: '30d'})
                            })
                        })
                    })
                 })
             })




            
            })

            })

            
            })
            
            })

        })
    .catch(error=>{
        console.log(error)
        return response.status(500).send({
            message: 'internal server error'
        })
    })
    })
    

authRouter.post('/customers/login', async (request, response)=>{
    try{

        const checkEmail = verify.checkEmail(request.body.customerEmail)
        if(!checkEmail)
        {
            return response.status(406).send({
                accepted: false,
                message: checkEmail.message
            })
        }

        const customerData = await customerDB.getCustomerByEmail(request.body.customerEmail)
        if(customerData.length == 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this account does not exist'
            })
        }


        if(!bcrypt.compareSync(request.body.customerPassword, customerData[0].password))
        {
            return response.status(406).send({
                accepted: false,
                message: 'bad credentials'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'login successfully',
            token: jwt.sign({customerID: customerData[0].id}, config.secretKey, {expiresIn: '30d'})
        })
      
    }
    catch(error)
    {
        console.log(error.message)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})





module.exports = authRouter

