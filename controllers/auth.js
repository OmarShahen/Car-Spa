

const authRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const customerDB = require('../models/customers')
const employeeDB = require('../models/employees')
const adminDB = require('../models/admins')
const phoneDB = require('../models/phones')
const verify = require('./verify-input')
const config = require('../config/config')
const bcrypt = require('bcrypt')
const mailer = require('../mails/mailController')
const verifyToken = require('../middleware/authority')
const fileValidation = require('../middleware/verify-files')


const test = async ()=>{
    const getData = await customerDB.getAllCustomers()
    console.log('Here')

    return getData.rows
}

test().then(data=>console.log(data)).catch(error=>console.log(error))

const userEmailExist = async (userEmail)=>{

    try{

        const adminResult = await adminDB.getAdminByEmail(userEmail)
        console.log(adminResult)
        if(adminResult.length != 0)
        {
            return true
        }

        const customerResult = await customerDB.getCustomerByEmail(userEmail)   
        console.log(customerResult)
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
                console.log(result)
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

                            mailer(request.body.customerEmail, request.body.customerFirstName)
                            .then(result=>{
                                return response.status(200).send({
                                    accepted: true,
                                    message: 'account created successfully',
                                    token: jwt.sign({userID: customerData.id}, config.secretKey, {expiresIn: '30d'})
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
            token: jwt.sign({userID: customerData[0].id}, config.secretKey, {expiresIn: '30d'})
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
            bcrypt.hashSync(request.body.adminPassword, 8)
        )

        const adminData = await adminDB.getAdminByEmail(request.body.adminEmail)
        const adminPhone = await phoneDB.addAdminPhoneNumberByID(request.body.adminPhoneNumber, adminData[0].id)

        return response.status(200).send({

            accepted: true,
            message: 'account created successfully',
            token: jwt.sign({userID: adminData[0].id}, config.secretKey, {expiresIn: '30d'})
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
            token: jwt.sign({userID: adminResult[0].id}, config.secretKey, {expiresIn: '30d'})
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

authRouter.post('/employees/sign-up', verifyToken, fileValidation, async (request, response, next)=>{

    try{

        const adminData = await adminDB.getAdminByID(request.userID)
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
            bcrypt.hashSync(request.body.employeePassword, 8),
            fileSavePath,
            new Date()
        )

        const employeeData = await employeeDB.getEmployeeByNationalID(request.body.employeeNationalID)

        return response.status(200).send({
            accepted: true,
            message: 'account created successfully',
            token: jwt.sign({userID: employeeData[0].id}, config.secretKey, {expiresIn: '30d'})
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


authRouter.post('/file-upload', fileValidation, async (request, response, next)=>{
    try{

    
    if(!request.files)
    {
        return response.status(406).send({
            accepted: false,
            message: 'empty files'
        })
    }

    const file = request.files.photo
    file.mv('./employees-files/' + file.name, (error, result)=>{
        if(error)
        {
            console.log(error)
            return response.status(500).send({
                accepted: false,
                message: 'internal server error'
            })
        }
        return response.status(200).send({
            accepted: true,
            message: 'uploaded successfully'
        })
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

