const config = require('../config/config')
const employeeToken = require('jsonwebtoken')

/*const isValidToken = async (token)=>{

    let functionReturn = ''
    employeeToken.verify(token, config.employeeSecretKey, (error, decoded)=>{
        if(error)
        {
            functionReturn = false
        }
        functionReturn = decoded
    })

    return functionReturn
}*/

const employeeAuth = (io) => {

    io.use((socket, next) => {

        if(!socket.handshake.query.token) {
            const error = new Error('token required')
            return next(error)
        }

        employeeToken.verify(socket.handshake.query.token, config.employeeSecretKey, (error, decoded) => {

            if(error) {
                const err = new Error('unauthorized')
                return next(err)
            }

            socket.employeeID = decoded.employeeID
            next()
        })


    })
}


module.exports = {
    employeeAuth
}