const authRouter = require('express').Router()
const customerJWT = require('jsonwebtoken')
const employeeJWT = require('jsonwebtoken')
const adminJWT = require('jsonwebtoken')
const customerDB = require('../models/customers')
const employeeDB = require('../models/employees')
const adminDB = require('../models/admins')
const phoneDB = require('../models/phones')
const verificationCodeDB = require('../models/verification-codes')
const verify = require('./verify-input')
const config = require('../config/config')
const bcrypt = require('bcrypt')
const { sendWelcomeMail } = require('../mails/mailController')
const { adminVerifyToken } = require('../middleware/authority')
const fileValidation = require('../middleware/verify-files')
const verifyInput = require('./verify-input')
const { checkPhoneNumber } = require('./verify-input')
const { response } = require('express')
const smsVerifiy = require('../sms/verfication-sms')
const verificationCodes = require('../models/verification-codes')

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


const getRandomInt = (min=1000, max=10000)=>{
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

const formatPhoneNumber = (phoneNumber)=>{

    let EGNumber = '+20'
    for(let i=1;i<phoneNumber.length;i++)
    {
        EGNumber += phoneNumber[i]
    }
    return EGNumber
}

authRouter.post('/customers/sign-up', async (request, response)=>{

    try{

        const checkFirstName1 = await verify.checkEmptyInput(request.body.customerName)
        if(!checkFirstName1.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkFirstName1.message,
                field: 'user name'
            })
        }

        const checkFirstName2 = await verify.checkName(request.body.customerName)
        if(!checkFirstName2.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkFirstName2.message,
                field: 'user name'
            })
        }
  

        const checkEmail = verify.checkEmail(request.body.customerEmail)
        if(!checkEmail.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkEmail.message,
                field: 'email'
            })
        }

        const emailExist = await userEmailExist(request.body.customerEmail)
        if(emailExist)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email is already taken',
                field: 'email'
            })
        }

        const checkPhone = await checkPhoneNumber(request.body.customerPhoneNumber)
        if(!checkPhone.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPhone.message,
                field: 'phone number'
            })
        }

        const phoneNumber = await customerDB.getCustomerByPhoneNumber(request.body.customerPhoneNumber)
        if(phoneNumber.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken',
                field: 'phone number'
            })
        }


        const checkPassword = verify.checkEmptyInput(request.body.customerPassword)
        if(!checkPassword.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPassword.message,
                field: 'password'
            })
        }

        const checkConfirmPassword = verify.checkEmptyInput(request.body.customerConfirmPassword)
        if(!checkConfirmPassword.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkConfirmPassword.message,
                field: 'password'
            })
        }

        if(request.body.customerPassword != request.body.customerConfirmPassword)
        {
            return response.status(406).send({
                accepted: false,
                message: 'confirm password is not the same as password',
                field: 'confirm password'
            })
        }

        if(!request.body.customerGoogleID) {
            request.body.customerGoogleID = null
        }

        const createCustomer = await customerDB.addCustomer(
            request.body.customerName,
            request.body.customerEmail,
            bcrypt.hashSync(request.body.customerPassword, config.bcryptRounds),
            request.body.customerPhoneNumber,
            request.body.customerGoogleID,
            new Date()
        )

        const getCustomer = await customerDB.getCustomerByEmail(request.body.customerEmail)

        return response.status(200).send({
            accepted: true,
            message: 'created account successfully',
            id: getCustomer[0].id,
            token: customerJWT.sign({customerID: getCustomer[0].id}, config.customerSecretKey, {expiresIn: '30d'})
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
            id: customerData[0].id,
            token: customerJWT.sign({customerID: customerData[0].id}, config.customerSecretKey, {expiresIn: '30d'})
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


authRouter.get('/customers/check-email/:email', async (request, response)=>{
    try{

        if(!request.params.email)
        {
            return response.status(406).send({
                accepted: false,
                message: 'invalid input'
            })
        }

        const checkEmail = verify.checkEmail(request.params.email)
        if(!checkEmail.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkEmail.message,
                field: 'email'
            })
        }
        
        const emailExist = await userEmailExist()
        if(emailExist)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email is already taken'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'valid email'
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

authRouter.post('/send-phone-number-verification', async (request, response)=>{
    try{

        const verifyPhoneNumber = await verify.checkPhoneNumber(request.body.phoneNumber)
        if(!verifyPhoneNumber.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: verifyPhoneNumber.message
            })
        }

        const checkPhoneNumber = await phoneDB.checkPhoneNumberExist(request.body.phoneNumber)
        if(checkPhoneNumber.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken'
            })
        }

        const verificationCode = getRandomInt()
        const createVC = await verficationCodesDB.createVerificationCode(request.body.phoneNumber, verificationCode)
        const sendSMS = await client.messages.create({
            to: formatPhoneNumber(request.body.phoneNumber),
            from: 'car-spa',
            body: `Your verfication code for car-spa account is ${verificationCode}`
        })

        console.log(sendSMS)

        return response.status(200).send({
            accepted: true,
            message: 'an SMS is sent to the provided phone number'
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


authRouter.post('/check-phone-number', async (request, response) => {

    try {

        if(request.body.customerPhoneNumber.length != 11) {
            
            return response.status(406).send({
                accepted: false,
                message: '11 digit is required'
            })
        }

        // Check in customers DB
        const customerData = await customerDB.getCustomerByPhoneNumber(request.body.customerPhoneNumber)
        if(customerData.length != 0) {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'valid phone number'
        })
    }
    catch(error) {
        console.log(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

authRouter.get('/verify-token', async (request, response)=>{
    try{

        jwt.verify(request.headers['x-access-token'], config.secretKey, (error, decoded)=>{
            if(error)
            {
                return response.status(500).send({
                    accepted: false,
                    message: 'internal server error'
                })
            }

            console.log(decoded.customerID)
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

authRouter.post('/admins/sign-up', async (request, response)=>{

    try{

        const checkFirstName = await verify.checkName(request.body.adminFirstName)
        if(!checkFirstName.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkFirstName.message
            })
        }

        const checkLastName = await verify.checkName(request.body.adminLastName)
        if(!checkLastName.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkLastName.message
            })
        }

        const checkEmail = verify.checkEmptyInput(request.body.adminEmail)
        if(!checkEmail.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkEmail.message
            })
        }

        const emailResult = await userEmailExist(request.body.adminEmail)
        if(emailResult)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email is already taken'
            })
        }

        const checkPassword = verify.checkEmptyInput(request.body.adminPassword)
        if(!checkPassword.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPassword.message
            })
        }

        const checkConfirmPassword = verify.checkEmptyInput(request.body.adminConfirmPassword)
        if(!checkConfirmPassword)
        {
            return response.status(406).send({
                accepted: false,
                message: checkConfirmPassword.message
            })
        }

        if(request.body.adminPassword != request.body.adminConfirmPassword)
        {
            return response.status(406).send({
                accepted: false,
                message: 'confirm password is not the same as password'
            })
        }

        const checkPhoneNumber = await verify.checkPhoneNumber(request.body.adminPhoneNumber)
        if(!checkPhoneNumber.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPhoneNumber.message
            })
        }

        const phoneResult = await phoneDB.checkPhoneNumberExist(request.body.adminPhoneNumber)
        if(phoneResult.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken'
            })
        }

        const admin = await adminDB.addAdmin(
            request.body.adminFirstName,
            request.body.adminLastName,
            request.body.adminEmail,
            bcrypt.hashSync(request.body.adminPassword, config.bcryptRounds)
        )

        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        const adminPhone = await phoneDB.addAdminPhoneNumberByID(request.body.adminPhoneNumber, adminData[0].id)

        return response.status(200).send({

            accepted: true,
            message: 'account created successfully',
            id: adminData[0].id,
            token: adminJWT.sign({adminID: adminData[0].id}, config.adminSecretKey, {expiresIn: '30d'})
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

authRouter.post('/admins/login', async (request, response)=>{

    try{

        const adminResult = await adminDB.getAdminByEmail(request.body.adminEmail)
        if(adminResult.length == 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this email does not exist'
            })
        }

        if(!bcrypt.compareSync(request.body.adminPassword, adminResult[0].password))
        {
            return response.status(406).send({
                acccepted: false,
                message: 'bad credentials'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'login successfully',
            id: adminResult[0].id,
            token: adminJWT.sign({adminID: adminResult[0].id}, config.adminSecretKey, {expiresIn: '30d'})
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

authRouter.post('/employees/sign-up', adminVerifyToken, fileValidation, async (request, response, next)=>{

    try{

        const adminData = await adminDB.getAdminByID(request.adminID)
        if(adminData.length == 0)
        {
            return response.status(401).send({
                accepted: false,
                message: 'unauthorized user'
            })
        }


        const checkFirstName = await verify.checkName(request.body.employeeFirstName)
        if(!checkFirstName.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkFirstName.message
            })
        }

        const checkLastName = await verify.checkName(request.body.employeeLastName)
        if(!checkLastName.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkLastName.message
            })
        }

        const checkAddress = verify.checkEmptyInput(request.body.employeeAddress)
        if(!checkAddress.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkAddress.message
            })
        }

        const checkNationalID = verify.checkEmptyInput(request.body.employeeNationalID)
        if(!checkNationalID.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkNationalID.message
            })
        }

        const nationalIDExist = await employeeDB.getEmployeeByNationalID(request.body.employeeNationalID)
        if(nationalIDExist.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this national ID is already taken'
            })
        }

        const checkPhoneNumber = await verify.checkPhoneNumber(request.body.employeePhoneNumber)
        if(!checkPhoneNumber.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPhoneNumber.message
            })
        }

        const checkPhoneNumberExist = await phoneDB.checkPhoneNumberExist(request.body.employeePhoneNumber)
        if(checkPhoneNumberExist.length != 0)
        {   
            return response.status(406).send({
                accepted: false,
                message: 'this phone number is already taken'
            })
        } 
        

        const checkPassword = verify.checkEmptyInput(request.body.employeePassword)
        if(!checkPassword.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkPassword.message
            })
        }

        const checkConfirmPassword = verify.checkEmptyInput(request.body.employeeConfirmPassword)
        if(!checkConfirmPassword.accepted)
        {
            return response.status(406).send({
                accepted: false,
                message: checkConfirmPassword.message
            })
        }

        if(request.body.employeePassword != request.body.employeeConfirmPassword)
        {
            return response.status(406).send({
                accepted: false,
                message: 'confirm password is not the same as password'
            })
        }

        

        const file = request.files.employeeCriminalRecord
        const fileSavePath = './employees-files/' + request.body.employeeFirstName + '-' + request.body.employeeLastName + '.png'
        const fileUploading = await file.mv(fileSavePath)

        const addEmployee = await employeeDB.addEmployee(
            request.body.employeeFirstName,
            request.body.employeeLastName,
            request.body.employeeAddress,
            request.body.employeeNationalID,
            bcrypt.hashSync(request.body.employeePassword, config.bcryptRounds),
            fileSavePath,
            new Date()
        )

        const employeeData = await employeeDB.getEmployeeByNationalID(request.body.employeeNationalID)
        const addEmployeePhone = await phoneDB.addEmployeePhoneNumberByID(request.body.employeePhoneNumber, employeeData[0].id)


        return response.status(200).send({
            accepted: true,
            message: 'account created successfully',
            id: employeeData[0].id,
            token: employeeJWT.sign({employeeID: employeeData[0].id}, config.employeeSecretKey, {expiresIn: '30d'})
        })
        
    }
    catch(error)
    {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }

})

authRouter.get('/employees/login', async (request, response)=>{
    try{

        const employeeData = await employeeDB.getEmployeeByPhoneNumber(request.body.employeePhoneNumber)
        
        if(employeeData.length == 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'this phone number does not exist'
            })
        }

        const isPasswordValid = bcrypt.compareSync(request.body.employeePassword, employeeData[0].password)
        if(!isPasswordValid)
        {
            return response.status(406).send({
                accepted: false,
                message: 'bad credentials'
            })
        }

        const employeeInfo = {
            firstname: employeeData[0].firstname,
            lastname: employeeData[0].lastname,
            address: employeeData[0].address,
            nationalid: employeeData[0].nationalid,
            phoneNumber: employeeData[0].phonenumber
        }

        return response.status(200).send({
            accepted: true,
            message: 'login successfully',
            employeeData: employeeInfo,
            token: employeeJWT.sign({employeeID: employeeData[0].id}, config.employeeSecretKey, {expiresIn: '30d'})
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


authRouter.post('/customers/phone-number/verification-code', async (request, response)=>{

    try{

        console.log(request.body)

        const verificationCode = getRandomInt()
        const addVerificationCode = await verificationCodeDB.createVerificationCode(
            `+${request.body.customerPhoneNumber.trim()}`,
            verificationCode
        )

        //const isSMSSent = smsVerifiy(request.body.customerPhoneNumber, verificationCode)

        return response.status(200).send({
            accepted: true,
            message: 'Message sent successfully'
        })

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            acccepted: false,
            message: 'internal server error'
        })
    }
})


authRouter.get('/customers/:phoneNumber/verifiy/:code', async (request, response) => {

    try {

        console.log(request.body)

        const checkCode = await verificationCodeDB.getVerificationCode(
            request.params.phoneNumber,
            request.params.code
        )

        if(checkCode.length != 1)
        {
            return response.status(406).send({
                accepted: false,
                message: 'Invalid verification code'
            })
        }

        const deleteCode = await verificationCodeDB.deleteVerificationCodes(
            request.params.phoneNumber,
            request.params.code
            )

        return response.status(200).send({
            accepted: true,
            message: 'Valid number'
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


module.exports = authRouter

