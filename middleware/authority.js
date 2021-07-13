
const jwt = require('jsonwebtoken')
const config = require('../config/config')


const verifyToken = async (request, response, next)=>{

    try{

        const token = request.headers['x-access-token']
        if(!token)
        {
            return response.status(500).send({
                accepted: false,
                message: 'no token provided'
            }) 
        }

        jwt.verify(token, config.secretKey, (error, decoded)=>{
            if(error)
            {
                console.log(error.message)
                return response.status(500).send({
                    accepted: false,
                    message: 'internal server error'
                })
            }

            request.userID = decoded.userID
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

module.exports = verifyToken