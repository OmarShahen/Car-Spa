

const authRouter = require('express').Router()
const { verify } = require('jsonwebtoken')
const customerDB = require('../models/customers')
const EmployeeDB = require('../models/employees')
const adminDB = require('../models/admins')
const verfiy = require('./verify-input')


const userEmailExist = async (userEmail)=>{

    const adminResult = await adminDB.getAdminByEmail(userEmail)
    
    const customerResult = await customerDB.getCustomerByEmail(userEmail)


}

userEmailExist('nashar@gmail.com')
.then(data=>console.log(data))
.catch(error=>console.log(error))





authRouter.post('/customers', (request, response)=>{

    
    verfiy.checkName(request.body.customerFirstName)
    .then(data=>{
        if(!data.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: data.message
            })
        }

        verfiy.checkName(request.body.customerLastName)
        .then(data=>{
            if(!data.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: data.message
                })
            }

            const checkMail = verfiy.checkEmail(request.body.customerEmail)
            console.log(checkMail)
            if(!checkMail.accepted)
            {
                return response.status(406).send({
                    accepted: false,
                    message: checkMail.message
                })
            }

            customerDB.getCustomerByEmail(request.body.customerEmail)
            .then(data=>{
                console.log(data)
                if(data.length != 0)
                {
                    return response.status(406).send({
                        accepted: false,
                        message: 'this mail is already taken'
                    })
                }
            })



            })

        })
    .catch(error=>{
        console.log(error.message)
        return {
            message: 'internal server error'
        }
    })
    })
    





module.exports = authRouter

