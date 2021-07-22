
const adminJWT = require('jsonwebtoken')
const customerJWT = require('jsonwebtoken')
const employeeJWT = require('jsonwebtoken')
const config = require('../config/config')


const adminVerifyToken = async (request, response, next)=>{

    try{

        const token = request.headers['x-access-token']
        if(!token)
        {
            return response.status(406).send({
                accepted: false,
                message: 'no token provided'
            }) 
        }

        adminJWT.verify(token, config.adminSecretKey, (error, decoded)=>{
            if(error)
            {
                return response.status(500).send({
                    accepted: false,
                    message: 'unauthorized to access this data'
                })
            }

            request.adminID = decoded.adminID
            next()
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

}

const customerVerifyToken = async (request, response, next)=>{
    try{

        const token = request.headers['x-access-token']
        if(!token)
        {
            return response.status(406).send({
                accepted: false,
                message: 'no token provided'
            })
        }

        customerJWT.verify(token, config.customerSecretKey, (error, decoded)=>{
            if(error)
            {
                return response.status(500).send({
                    accepted: false,
                    message: 'unauthorized to access this data'
                })
            }

            request.customerID = decoded.customerID
            next()
        })

        
    }
    catch(error)
    {
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
}

const employeeVerifyToken = async (request, response, next)=>{

    try{

        const token = request.headers['x-access-token']
        if(!token)
        {
            return response.status(406).send({
                accepted: false,
                message: 'no token provided'
            })
        }

        employeeJWT.verify(token, config.employeeSecretKey, (error, decoded)=>{
            if(error)
            {
                return response.status(500).send({
                    accepted: false,
                    message: 'unauthorized to access this data'
                })
            }

            request.employeeID = decoded.employeeID
            next()
        })
    }
    catch(error)
    {
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
}



module.exports = {
    adminVerifyToken,
    customerVerifyToken,
    employeeVerifyToken
}