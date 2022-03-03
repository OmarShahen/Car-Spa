


const { response } = require('express')
const dbConnect = require('../config/db')
const employees = require('./employees')


class Order{

    async getOrderByDateAndTime(orderDate, orderTime)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM orders WHERE OrderDate = $1 AND BookingTimeID = (SELECT ID FROM BookingTimes WHERE BookTime = $2)'
        const client = await pool.connect()
        const ordersData = await client.query(query, [orderDate, orderTime])
        client.release()

        return ordersData.rows
    }

    async getOrderByID(orderID) {

        const pool = await dbConnect()
        const query = 'SELECT * FROM orders WHERE ID = $1'
        const client = await pool.connect()
        const orderData = await client.query(query, [orderID])
        client.release()

        return orderData.rows
    }

    async getOrderDataByID(orderID) {

        const pool = await dbConnect()
        const query = `
            SELECT
            customers.ID AS CustomerID, customers.username AS CustomerName, customers.phoneNumber AS CustomerPhoneNumber,
            employees.ID AS EmployeeID, employees.userName AS EmployeeUserName,
            employees.phoneNumber AS EmployeePhoneNumber, orders.OrderDate,
            BookingTimes.BookTime, services.Name AS ServiceName, services.description AS ServiceDescription,
            orders.active, orders.rating, orders.OrderCreationDate, orders.longitude,
            orders.latitude, orders.LocationName, orders.price
            FROM orders 
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN BookingTimes ON BookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE
            orders.ID = $1
        `
        const client = await pool.connect()
        const ordersData = await client.query(query, [orderID])
        client.release()

        return ordersData.rows
    }

    async getOrdersByDate(orderDate)
    {
        const pool = await dbConnect()
        /*const query = `
            SELECT 
            customers.username AS CustomerUserName,
            employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName, orders.OrderDate,
            bookingTimes.BookTime, services.name, services.price, services.description,
            orders.id, orders.OrderCreationDate, orders.done, orders.rating
            FROM orders
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE orders.OrderDate = $1
        `*/

        const query = 'SELECT * FROM orders WHERE OrderDate = $1'
        const client = await pool.connect()
        const ordersData = await client.query(query, [orderDate])
        client.release()

        return ordersData.rows
    }

    async getEarningsOfTheDay(orderDate)
    {
        const pool = await dbConnect()
        const query = `
            SELECT
            orders.ServiceID, SUM(services.price)
            FROM orders
            INNER JOIN services ON orders.ServiceID = services.ID
            WHERE OrderDate = $1
            GROUP BY orders.ServiceID
            `
        const client = await pool.connect()
        const earnings = await client.query(query, [orderDate])
        client.release()

        return earnings.rows
    }

    async getNoOfOrdersForEachEmployeeByDate(orderDate)
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE OrderDate = $1 GROUP BY EmployeeID ORDER BY COUNT ASC'
        const client = await pool.connect()
        const ordersData = await client.query(query, [orderDate])
        client.release()

        return ordersData.rows
    }

    async getNoOfOrdersForEmployees(ss, employeesIDs)
    {

        const pool = await dbConnect()
        const query = `
            SELECT 
            COUNT(ID), employeeID
            FROM orders
            WHERE employeeID IN (` + ss + `)
            AND orderDate >= (SELECT MIN(accountCreationDate) FROM employees 
            WHERE ID IN (` + ss + `)) AND done = TRUE GROUP BY employeeID
        `
        const client = await pool.connect()
        const employeesData = await client.query(query, employeesIDs)
        client.release()

        return employeesData.rows

    }

    async getNoAndAvgOfOrdersForEmployee(employeeID) {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), AVG(rating) FROM orders WHERE EmployeeID = $1'
        const client = await pool.connect()
        const ordersData = await client.query(query, [employeeID])
        client.release()

        return ordersData.rows
    }

    async getEmployeeDataAndOrders(employeeID){

        const pool = await dbConnect()
        const query = `
            SELECT
            employees.userName, employees.PhoneNumber, employees.NationalID,
            employees.AccountCreationDate, orders.ID, bookingTimes.BookTime, orders.OrderDate,
            orders.rating
            FROM orders
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
            WHERE orders.EmployeeID = $1
            ORDER BY ID ASC
        `
        const client = await pool.connect()
        const ordersData = await client.query(query, [employeeID])
        client.release()

        return ordersData.rows

    }

    // ss refers to the number of $n that will be queried 
    async getAvgerageRatingForEachEmployee(ss, employeesIDs)
    {
        const pool = await dbConnect()
        const query = 'SELECT AVG(rating), employeeID FROM orders WHERE EmployeeID IN (' + ss + ') AND OrderDate > (SELECT MIN(AccountCreationDate) FROM employees) AND done = TRUE GROUP BY employeeID ORDER BY AVG DESC'
        const client = await pool.connect()
        const employeesAverage = await client.query(query, employeesIDs)
        client.release()

        return employeesAverage.rows
    }

    async getNoOfOrdersForThoseEmployeesByDate(employeesIDs, ss, orderDate, orderDateSS)
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE EmployeeID IN (' + ss + ') AND OrderDate = ' + orderDateSS + ' GROUP BY EmployeeID'
        const client = await pool.connect()
        const employeeData = await client.query(query, [...employeesIDs, orderDate])
        client.release()

        return employeeData.rows
    }

    async getNoOfOrdersForThoseEmployeesFromDate(employeesIDs, ss, orderDate, orderDateSS)
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE EmployeeID IN (' + ss + ') AND OrderDate >= ' + orderDateSS + ' GROUP BY EmployeeID'
        const client = await pool.connect()
        const employeeData = await client.query(query, [...employeesIDs, orderDate])
        client.release()

        return employeeData.rows

    }

    async getTotalOrdersFromLastEmployeeAccount()
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE OrderDate >= (SELECT MIN(AccountCreationDate) FROM employees) AND done = TRUE GROUP BY EmployeeID ORDER BY COUNT ASC'
        const client = await pool.connect()
        const totalOrders = await client.query(query)
        client.release()

        return totalOrders.rows
    }


    async addOrder(customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, locationName, longitude, latitude, price, active=false, rating=0)
    {

        const orderData = [
            customerID, employeeID, orderDate, bookingTimeID,
            serviceID, orderCreationDate, locationName, longitude,
            latitude, price, active, rating
        ]

        const pool = await dbConnect()
        const query = `
            INSERT INTO orders(
                CustomerID, EmployeeID, OrderDate, BookingTimeID,
                ServiceID, OrderCreationDate, LocationName,
                longitude, latitude, price, active, rating
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `
        const client = await pool.connect()
        const insertData = await client.query(query, orderData)
        client.release()

        return true    
    }

    async getOrderByMainData(customerID, employeeID, orderDate, bookingTimeID)
    {
        const pool = await dbConnect()
        const query = `
            SELECT 
            employees.userName AS EmployeeName,  orders.OrderDate,
            bookingTimes.BookTime, services.name AS ServiceName, services.description AS ServiceDescription, orders.id, orders.OrderCreationDate,
            orders.LocationName, orders.longitude, orders.latitude, orders.price
            FROM orders
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE orders.customerID = $1 AND orders.EmployeeID = $2
            AND orders.OrderDate = $3 AND orders.BookingTimeID = $4
        `
        const client = await pool.connect()
        const orderData = await client.query(query, [customerID, employeeID, orderDate, bookingTimeID])
        client.release()

        return orderData.rows
    }

    async getCustomerPastOrders(customerID, todayDate)
    {
        const pool = await dbConnect()
        const query = `
            SELECT 
            customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
            employees.userName AS EmployeeUserName,
            orders.OrderDate, bookingTimes.BookTime,
            services.name, orders.done, orders.rating,
            orders.orderCreationDate, orders.cancelled
            FROM orders 
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN BookingTimes ON BookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE CustomerID = $1 AND OrderDate < $2
            ORDER BY OrderDate DESC
        `
        const client = await pool.connect()
        const customerOrders = await client.query(query, [customerID, todayDate])
        client.release()

        return customerOrders.rows  
    }

    async getCustomerUpcomingOrders(customerID)
    {
        const pool = await dbConnect()
        const query = `
            SELECT
            customers.userName,
            employees.userName AS EmployeeUserName,
            orders.OrderDate, bookingTimes.BookTime,
            services.name, orders.rating,
            orders.orderCreationDate, orders.locationName,
            orders.longitude, orders.latitude, orders.price
            FROM orders 
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN BookingTimes ON BookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE CustomerID = $1
            ORDER BY OrderDate ASC
        `
        const client = await pool.connect()
        const customerOrders = await client.query(query, [customerID])
        client.release()

        return customerOrders.rows  
    }

    async getCustomerCurrentOrders(customerID, todayDate)
    {
        const pool = await dbConnect()
        const query = `
            SELECT 
            customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
            employees.userName AS EmployeeUserName,
            orders.OrderDate, bookingTimes.BookTime,
            services.name, orders.done, orders.rating,
            orders.orderCreationDate, orders.cancelled
            FROM orders 
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN employees ON employees.ID = orders.EmployeeID
            INNER JOIN BookingTimes ON BookingTimes.ID = orders.BookingTimeID
            INNER JOIN services ON services.ID = orders.ServiceID
            WHERE CustomerID = $1
            AND OrderDate = $2
            ORDER BY OrderDate ASC
        `
        const client = await pool.connect()
        const customerOrders = await client.query(query, [customerID, todayDate])
        client.release()

        return customerOrders.rows
    }

    async getCustomerPreviuosLocations(customerID) {

        const pool = await dbConnect()
        const query = 'SELECT LocationName, longitude, latitude FROM orders WHERE CustomerID = $1'
        const client = await pool.connect()
        const prevLocations = await client.query(query, [customerID])
        client.release()

        return prevLocations.rows
    }

    async getOrderPriceByCustomerID(customerID) {

        const pool = await dbConnect()
        const query = `SELECT ID, price FROM orders WHERE CustomerID = $1`
        const client = await pool.connect()
        const orderPrice = await client.query(query, [customerID])
        client.release()

        return orderPrice.rows
    }

    async setOrderRating(orderID, rating) {

        const pool = await dbConnect()
        const query = 'UPDATE orders SET rating = $1 WHERE ID = $2'
        const client = await pool.connect()
        const orderUpdated = await client.query(query, [rating, orderID])
        client.release()

        return true
    }

    async deleteOrderByID(orderID) {

        const pool = await dbConnect()
        const query = `DELETE FROM orders WHERE ID = $1`
        const client = await pool.connect()
        const deleteOrder = await client.query(query, [orderID])
        client.release()

        return true       
    }

    async setOrderPriceByCustomerID(price, customerID) {

        const pool = await dbConnect()
        const query = 'UPDATE orders SET price = $1 WHERE CustomerID = $2'
        const client = await pool.connect()
        const updatedPrice = await client.query(query, [price, customerID])
        client.release()

        return true
    }

    async getEmployeeOrdersByDate(employeeID, ordersDate) {

        const pool = await dbConnect()
        const query = `
            SELECT
            customers.username AS CustomerName, customers.PhoneNumber AS CustomerPhoneNumber, 
            orders.OrderDate,bookingTimes.BookTime, services.name AS ServiceName,
            orders.longitude, orders.latitude, orders.locationName, orders.price
            FROM orders
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
            INNER JOIN services  ON services.ID = orders.ServiceID
            WHERE
            EmployeeID = $1 AND OrderDate = $2
            ORDER BY OrderDate DESC
        `
        const client = await pool.connect()
        const employeeOrders = await client.query(query, [employeeID, ordersDate])
        client.release()

        return employeeOrders.rows
    }

    async getEmployeeOrdersAfterDate(employeeID, ordersDate) {

        const pool = await dbConnect()
        const query = `
            SELECT
            customers.username AS CustomerName, customers.PhoneNumber AS CustomerPhoneNumber, 
            orders.OrderDate,bookingTimes.BookTime, services.name AS ServiceName,
            orders.longitude, orders.latitude, orders.locationName, orders.price
            FROM orders
            INNER JOIN customers ON customers.ID = orders.CustomerID
            INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
            INNER JOIN services  ON services.ID = orders.ServiceID
            WHERE
            EmployeeID = $1 AND OrderDate > $2
            ORDER BY OrderDate DESC
        `
        const client = await pool.connect()
        const employeeOrders = await client.query(query, [employeeID, ordersDate])
        client.release()

        return employeeOrders.rows
    }

    async setOrderToActive(orderID) {

        const pool = await dbConnect()
        const query = `UPDATE orders SET active = True WHERE ID = $1`
        const client = await pool.connect()
        const updateOrder = await client.query(query, [orderID])
        client.release()

        return true 
    }

    async deleteOrderByID(orderID) {

        const pool = await dbConnect()
        const query = `DELETE FROM orders WHERE ID = $1`
        const client = await pool.connect()
        const orderDeleted = await client.query(query, [orderID])
        client.release()

        return true
    }
}



module.exports = new Order()