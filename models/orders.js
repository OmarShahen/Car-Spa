


const dbConnect = require('../config/db')
const employees = require('./employees')


class Order{

    async getOrderByDateAndTime(orderDate, orderTime)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM orders WHERE OrderDate = $1 AND BookingTimeID = (SELECT ID FROM BookingTimes WHERE BookTime = $2)'
            const client = await pool.connect()
            const ordersData = await client.query(query, [orderDate, orderTime])
            pool.end()
            return ordersData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getOrdersByDate(orderDate)
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT 
                customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
                employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName, orders.OrderDate,
                bookingTimes.BookTime, services.name, services.price, services.description,
                orders.id, orders.OrderCreationDate, orders.done, orders.rating
                FROM orders
                INNER JOIN customers ON customers.ID = orders.CustomerID
                INNER JOIN employees ON employees.ID = orders.EmployeeID
                INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
                INNER JOIN services ON services.ID = orders.ServiceID
                WHERE orders.OrderDate = $1
            `
            const client = await pool.connect()
            const ordersData = await client.query(query, [orderDate])
            pool.end()
            return ordersData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getEarningsOfTheDay(orderDate)
    {
        try{

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
            pool.end()
            return earnings.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getNoOfOrdersForEachEmployeeByDate(orderDate)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE OrderDate = $1 GROUP BY EmployeeID ORDER BY COUNT ASC'
            const client = await pool.connect()
            const ordersData = await client.query(query, [orderDate])
            pool.end()
            return ordersData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getNoOfOrdersForEmployees(ss, employeesIDs)
    {
        try{

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
            pool.end()
            return employeesData.rows

        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    // ss refers to the number of $n that will be queried 
    async getAvgerageRatingForEachEmployee(ss, employeesIDs)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT AVG(rating), employeeID FROM orders WHERE EmployeeID IN (' + ss + ') AND OrderDate > (SELECT MIN(AccountCreationDate) FROM employees) AND done = TRUE GROUP BY employeeID ORDER BY AVG DESC'
            const client = await pool.connect()
            const employeesAverage = await client.query(query, employeesIDs)
            pool.end()
            return employeesAverage.rows

        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getNoOfOrdersForThoseEmployeesByDate(ss, employeesIDs, orderDate, orderDateSS)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE EmployeeID IN (' + ss + ') AND OrderDate = ' + orderDateSS + ' GROUP BY EmployeeID'
            const client = await pool.connect()
            const employeeData = await client.query(query, [...employeesIDs, orderDate])
            pool.end()
            return employeeData.rows

        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getTotalOrdersFromLastEmployeeAccount()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT COUNT(ID), EmployeeID FROM orders WHERE OrderDate >= (SELECT MIN(AccountCreationDate) FROM employees) AND done = TRUE GROUP BY EmployeeID ORDER BY COUNT ASC'
            const client = await pool.connect()
            const totalOrders = await client.query(query)
            pool.end()
            return totalOrders.rows

        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async addOrder(customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, serviceQuantity=1, active=false, rating=0, done=false)
    {
        try{

            const orderData = [customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, active, rating, done]
            const pool = await dbConnect()
            const query = 'INSERT INTO orders(CustomerID, EmployeeID, OrderDate, BookingTimeID, ServiceID, OrderCreationDate, active, rating, done) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)'
            const client = await pool.connect()
            const insertData = await client.query(query, orderData)
            pool.end()
            return true

        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getOrderByMainData(customerID, employeeID, orderDate, bookingTimeID)
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT 
                employees.FirstName, employees.LastName, phones.PhoneNumber, orders.OrderDate,
                bookingTimes.BookTime, services.name, services.price, services.description, orders.id, orders.OrderCreationDate
                FROM orders
                INNER JOIN employees ON employees.ID = orders.EmployeeID
                INNER JOIN bookingTimes ON bookingTimes.ID = orders.BookingTimeID
                INNER JOIN services ON services.ID = orders.ServiceID
                INNER JOIN phones ON phones.EmployeeID = orders.employeeID
                WHERE orders.customerID = $1 AND orders.EmployeeID = $2
                AND orders.OrderDate = $3 AND orders.BookingTimeID = $4
            `
            const client = await pool.connect()
            const orderData = await client.query(query, [customerID, employeeID, orderDate, bookingTimeID])
            pool.end()
            return orderData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerPastOrders(customerID, todayDate)
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT 
                customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
                employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName,
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
            pool.end()
            return customerOrders.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerUpcomingOrders(customerID, todayDate)
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT
                customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
                employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName,
                orders.OrderDate, bookingTimes.BookTime,
                services.name, orders.done, orders.rating,
                orders.orderCreationDate, orders.cancelled
                FROM orders 
                INNER JOIN customers ON customers.ID = orders.CustomerID
                INNER JOIN employees ON employees.ID = orders.EmployeeID
                INNER JOIN BookingTimes ON BookingTimes.ID = orders.BookingTimeID
                INNER JOIN services ON services.ID = orders.ServiceID
                WHERE CustomerID = $1
                AND OrderDate > $2
                AND cancelled = FALSE
                ORDER BY OrderDate ASC
            `
            const client = await pool.connect()
            const customerOrders = await client.query(query, [customerID, todayDate])
            pool.end()
            return customerOrders.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerCurrentOrders(customerID, todayDate)
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT 
                customers.FirstName AS CustomerFirstName, customers.LastName AS CustomerLastName,
                employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName,
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
            pool.end()
            return customerOrders.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
}



module.exports = new Order()