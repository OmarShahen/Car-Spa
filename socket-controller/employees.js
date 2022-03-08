
const config = require('../config/config')
const employeeToken = require('jsonwebtoken')
const orderDB = require('../models/orders')
const employeeDB = require('../models/employees')
const { employeeAuth } = require('../socket-middleware/auth')



module.exports = io => {

    const employeeNSP = io.of('/employees')
    

    // Employee Socket Auth

    employeeAuth(employeeNSP)

    employeeNSP.on('connection', socket => {
        
        try {

            employeeDB.setEmployeeActive(socket.employeeID)

            socket.join(`${ socket.employeeID }`)

            socket.on('disconnect', () => {
                employeeDB.setEmployeeNotActive(socket.employeeID)
            })

        } catch(error) {
            console.error(error)
            socket.emit('error', {
                accepted: false,
                message: 'internal server error'
            })
        }

    })


}