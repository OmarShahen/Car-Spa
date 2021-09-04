
const adminRoute = require('express').Router()
const path = require('path')
const config = require('../config/config')
const adminDB = require('../models/admins')
const customerDB = require('../models/customers')
const orderDB = require('../models/orders')
const bcrypt = require('bcrypt')
const { adminForgotPassword } = require('../mails/mailController')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const { adminVerifyToken } = require('../middleware/authority')
const { response } = require('express')
const verifiySession = require('../middleware/session-auth')
const verifiyAdmin = require('../middleware/session-auth')




const formatHost = (host)=>{
    
    if(host == 'localhost:' + config.port)
    {
        return 'http://' + host + '/api/admins/forgot-password-form'
    }
    else{
        return 'https://' + host + '/api/admins/forgot-password-form'
    }
}

const properDate = (dateObj)=>{

    return dateObj.getFullYear().toString() + '-' + (dateObj.getMonth()+1).toString() + '-' + dateObj.getDate().toString()
}


const calculateDayIncome = (servicesPays)=>{
    
    if(servicesPays.length == 0)
    {
        return 0
    }

    if(servicesPays == 1)
    {
        return Number(servicesPays[0].sum)
    }

    let total = 0
    for(let i=0;i<servicesPays.length;i++)
    {
        total += Number(servicesPays[i].sum)
    }

    return total

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

        request.session.adminID = adminData[0].id
        return response.redirect('/api/admins/admin-dashboard')

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

// Admin Dashboard
adminRoute.get('/admins/admin-dashboard/:todayDate', async (request, response)=>{
    try{

        const adminData = await adminDB.getAdminByID(request.session.adminID)
        const noOfCustomers = await customerDB.getNoOfCustomers()
        const getIncome = await orderDB.getEarningsOfTheDay(request.params.todayDate)
        const todaysIncome = calculateDayIncome(getIncome)
        const todaysOrders = await orderDB.getOrdersByDate(request.params.todayDate)

        return response.status(200).send({
            noOfCustomers: Number(noOfCustomers[0].count),
            income: todaysIncome,
            orders: todaysOrders,
            adminData: adminData[0]
        })

    }
    catch(error)
    {
        return response.status(500)
    }
})

adminRoute.get('/admins/admin-dashboard', verifiySession, (request, response)=>{
    try{

        return response.render('admin-dashboard')
    }
    catch(error)
    {
        console.log(error)
        return response.status(500)
    }
})


// Admin Employees
adminRoute.get('/admins/employees', verifiySession, (request, response)=>{

    try{

        
    }
    catch(error)
    {
        return response.status(500)
    }
})





module.exports = adminRoute