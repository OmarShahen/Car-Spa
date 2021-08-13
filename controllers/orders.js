
const orderRoute = require('express').Router()
const { customerVerifyToken } = require('../middleware/authority')
const reservedDaysDB = require('../models/reserved-days')
const { param } = require('./admins')

orderRoute.post('/orders/check-day/:day', customerVerifyToken, async (request, response)=>{

    try{

        console.log(request.params.day)
        console.log(new Date(request.params.day.split('-').join('/')))
        const checkDay = await reservedDaysDB.getDay(new Date(request.params.day.split('-').join('/')))
        console.log(checkDay)
        if(checkDay.length != 0)
        {
            return response.status(406).send({
                accepted: false,
                message: 'there is no service on this day'
            })
        }

        return response.status(200).send({
            accepted: true,
            message: 'there is service on this day'
        })

    }
    catch(error)
    {
        console.log(error)
        return response.status(500).send({
            message: 'internal server error'
        })
    }
})






module.exports = orderRoute