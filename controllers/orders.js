
const orderRoute = require('express').Router()
const { request } = require('express')
const { customerVerifyToken } = require('../middleware/authority')
const reservedDaysDB = require('../models/reserved-days')
const bookingTimesDB = require('../models/booking-times')
const { param } = require('./admins')

orderRoute.post('/orders/check-day/:day', customerVerifyToken, async (request, response)=>{

    try{

        const checkDay = await reservedDaysDB.getDay(new Date(request.params.day.split('-').join('/')))
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


orderRoute.get('/orders/book-later/available-times', customerVerifyToken, async (request, response)=>{
    try{

        const availableTimes = await bookingTimesDB.getAvailableTimes()
        return response.status(200).send({
            accepted: true,
            availableTimes: availableTimes
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

orderRoute.get('/orders/book-now/available-times/', customerVerifyToken, async (request, response)=>{

    try{

        const correctDate = new Date().getHours() + ':00:00'
        const availableTimes = await bookingTimesDB.getAvailableTimesFromHour(correctDate)
        return response.status(200).send({
            accepted: true,
            availableTimes: availableTimes
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






module.exports = orderRoute