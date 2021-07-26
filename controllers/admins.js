
const adminRoute = require('express').Router()
const path = require('path')
const config = require('../config/config')
const adminDB = require('../models/admins')
const bcrypt = require('bcrypt')
const { adminForgotPassword } = require('../mails/mailController')


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

    return response.render('admin-form')
})

adminRoute.post('/admins/login-form/submit', async (request, response)=>{

    try{

        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        if(adminData.length == 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email does not exist',
                field: 'email'
            })
        }

        if(!bcrypt.compareSync(request.body.adminPassword, adminData[0].password))
        {
            return response.status(401).send({
                accepted: false,
                message: 'bad credentials',
                field: 'password'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'Passed'
        })

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


adminRoute.post('/admins/login-form/review', async (request, response)=>{
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
})

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

        const url = formatHost(request.headers.host) + '/' + new Date().toString().split(' ').join('*')
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

adminRoute.get('/admins/forgot-password-form/:date', async (request, response)=>{
    try{

        console.log(request.params.date.split('*').join(' '))
        

        return response.status(200).send({
            accepted: true
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



module.exports = adminRoute