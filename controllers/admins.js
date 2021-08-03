
const adminRoute = require('express').Router()
const path = require('path')
const config = require('../config/config')
const adminDB = require('../models/admins')
const bcrypt = require('bcrypt')
const { adminForgotPassword } = require('../mails/mailController')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const { adminVerifyToken } = require('../middleware/authority')



const formatHost = (host)=>{
    
    if(host == 'localhost:' + config.port)
    {
        return 'http://' + host + '/api/admins/forgot-password-form'
    }
    else{
        return 'https://' + host + '/api/admins/forgot-password-form'
    }
}

adminRoute.get('/admins/login-form', (request, response)=>{

    return response.render('admin-form', {'submissionResponse': request.flash('submissionData')})
})

adminRoute.post('/admins/login-form/submit', async (request, response)=>{

    try{

        submissionData = {
            email: request.body.adminEmail,
            password: request.body.adminPassword
        }
        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        if(adminData.length == 0)
        {
            submissionData.emailError = 'This email does not exist'
            request.flash('submissionData', submissionData)
            return response.redirect('/api/admins/login-form')
        }

        if(!bcrypt.compareSync(request.body.adminPassword, adminData[0].password))
        {
            submissionData.passwordError = 'Wrong password'
            request.flash('submissionData', submissionData)
            return response.redirect('/api/admins/login-form')
        }

        return response.render('admin-dashboard')

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error',
            field: 'server'
        })
    }
})


/*adminRoute.post('/admins/login-form/review', async (request, response)=>{
    try{

        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        if(adminData.length == 0)
        {
            return response.status(406)
        }

        if(!bcrypt.compareSync(request.body.adminPassword, adminData[0].password))
        {
            return response.status(401)
        }

        return response.render('admin-dashboard')
        
    }
    catch(error)
    {
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})*/

adminRoute.post('/admins/forgot-password', async (request, response)=>{
    try{

        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        if(adminData.length == 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this account does not exist'
            })
        }

        const token = jwt.sign({adminID: adminData[0].id}, config.adminSecretKey, {expiresIn: '90m'})
        const url = formatHost(request.headers.host) + '/' + token
        const mailResult = await adminForgotPassword(request.body.adminEmail, url)
    
        return response.status(200).send({
            accepted: true,
            message: 'verfication link is sent to your mail'
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

adminRoute.get('/admins/forgot-password-form/:token', async (request, response)=>{
    try{

        jwt.verify(request.params.token, config.adminSecretKey, (error, decoded)=>{
            if(error)
            {
                return response.status(500).send({
                    accepted: false,
                    message: 'internal server error'
                })
            }
            
            return response.render('admin-new-password', {token: request.params.token})
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

adminRoute.post('/admins/forgot-password-form/submit', async (request, response)=>{
    try{

        const decoded = jwt.verify(request.body.accessToken, config.adminSecretKey)
            
        if(request.body.adminNewPassword != request.body.adminConfirmNewPassword)
        {
            return response.status(406).send({
                accepted: false,
                message: 'the passwords must match'
            })
        }

        const encryptedPassword = bcrypt.hashSync(request.body.adminNewPassword, config.bcryptRounds)
        const adminResult = await adminDB.setAdminPassword(encryptedPassword, decoded.adminID)
        return response.redirect('/api/admins/login-form')

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



module.exports = adminRoute