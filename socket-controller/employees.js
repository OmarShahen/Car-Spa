
const config = require('../config/config')
const employeeToken = require('jsonwebtoken')
const orderDB = require('../models/orders')

const isValidToken = async (token)=>{

    let functionReturn = ''
    employeeToken.verify(token, config.employeeSecretKey, (error, decoded)=>{
        if(error)
        {
            functionReturn = false
        }
        functionReturn = decoded
    })

    return functionReturn
}


module.exports = io => {

    const employeeNSP = io.of('/orders')

    employeeNSP.on('connection', socket => {
        
        try {

            socket.on('employee-login', async employeeData => {

            const employeeDecodedToken = await isValidToken(employeeData.accessToken)

            if(!employeeDecodedToken) {

                return socket.emit('error', {
                    accepted: false,
                    message: 'invalid access to data'
                })
            }

            console.log(employeeDecodedToken.employeeID)

            socket.join(`${ employeeDecodedToken.employeeID }`)

            })

        } catch(error) {
            console.error(error)
            return socket.emit('error', {
                accepted: false,
                message: 'internal server error'
            })
        }
    })
}