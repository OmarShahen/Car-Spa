
const config = require('../config/config')
const customerToken = require('jsonwebtoken')

const isValidToken = async (token)=>{

    let functionReturn = ''
    customerToken.verify(token, config.customerSecretKey, (error, decoded)=>{
        if(error)
        {
            functionReturn = false
        }
        functionReturn = decoded
    })

    return functionReturn
}

module.exports = io => {

    const customerNSP = io.of('/orders')

    customerNSP.on('connection', socket => {

        try {

            socket.on('customer-login', async customerData => {

                const customerDecodedToken = await isValidToken(customerData.accessToken)

                if(!customerDecodedToken) {

                    return socket.emit('error', {
                        accepted: false,
                        message: 'invalid access to data'
                    })
                }

                console.log(customerDecodedToken.customerID)

                socket.join(`${ customerDecodedToken.customerID }`)
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
