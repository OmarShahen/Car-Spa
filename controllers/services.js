
const serviceRoute = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const serviceDB = require('../models/services')


serviceRoute.get('/services', customerVerifyToken, async (request, response) => {

    try {

        const services = await serviceDB.getAllServices()

        return response.status(200).send({
            accepted: true,
            services: services
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})

serviceRoute.post('/services', async (request, response) => {

    try {

        if(!request.body.name) {

            return response.status(406).send({
                accepted: false,
                message: 'service name is required'
            })
        }

        if(!request.body.price) {

            return response.status(406).send({
                accepted: false,
                message: 'service price is required'
            })
        }

        if(!request.body.description) {

            return response.status(406).send({
                accepted: false,
                message: 'service description is required'
            })
        }

        const addService = await serviceDB.addService(
            request.body.name,
            request.body.price,
            request.body.description
        )
        
        return response.status(200).send({
            accepted: true,
            message: 'service created successfully'
        })

    } catch(error) {
        console.error(error)
        return response.status(500).send({
            accepted: false,
            message: 'internal server error'
        })
    }
})


module.exports = serviceRoute