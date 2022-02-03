
const employeeDB = require('../models/employees')
const orderDB = require('../models/orders')
const bookingTimeDB = require('../models/booking-times')


const employeesAvailableAtThatTime = async (orderDate, orderTime) => {

    const orders = await orderDB.getOrderByDateAndTime(orderDate, orderTime)
    const noOfEmployees = await employeeDB.getActiveEmployees()
    


}


module.exports = {
    employeesAvailableAtThatTime,
}