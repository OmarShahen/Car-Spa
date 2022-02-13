
const dbConnect = require('../config/db')

class DoneOrder {

    async addDoneOrder(customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, longitude, latitude, locationName, price, rating=5) {

        const pool = await dbConnect()
        const query = `
            INSERT INTO doneOrders(
                CustomerID, EmployeeID, OrderDate, BookingTimeID, ServiceID,
                OrderCreationDate, longitude, latitude, LocationName, price, rating
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `
        const client = await pool.connect()
        const addDoneOrderData = await client.query(query, [customerID, employeeID, orderDate, bookingTimeID, serviceID, rating, orderCreationDate, longitude, latitude, locationName, price])
        pool.end()

        return true
    }


    async getDoneOrdersByCustomerID(customerID) {

        const pool = await dbConnect()
        const query = `
            SELECT 
            employees.FirstName AS EmployeeFirstName, employees.LastName AS EmployeeLastName,
            doneOrders.OrderDate, bookingTimes.BookTime, services.name, doneOrders.rating,
            doneOrders.orderCreationDate, doneOrders.longitude, doneOrders.latitude,
            doneOrders.locationName, doneOrders.price
            FROM doneOrders 
            INNER JOIN employees ON employees.ID = doneOrders.EmployeeID
            INNER JOIN BookingTimes ON BookingTimes.ID = doneOrders.BookingTimeID
            INNER JOIN services ON services.ID = doneOrders.ServiceID
            WHERE CustomerID = $1
            ORDER BY OrderDate ASC
        `
        const client = await pool.connect()
        const customerDoneOrders = await client.query(query, [customerID])
        pool.end()

        return customerDoneOrders.rows

    }

    async getDoneOrder(orderID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM doneOrders WHERE ID = $1`
        const client = await pool.connect()
        const orderData = await client.query(query, [orderID])
        pool.end()

        return orderData.rows
    }

    async rateDoneOrder(orderID, rate) {

        const pool = await dbConnect()
        const query = `UPDATE doneOrders SET rating = $1 WHERE ID = $2`
        const client = await pool.connect()
        const orerRate = await client.query(query, [rate, orderID])
        pool.end()

        return true
    }

    async getDoneOrderByCustomerIDandOrderDate(customerID, orderDate) {

        const pool = await dbConnect()
        const query = `SELECT * FROM doneOrders WHERE CustomerID = $1 AND OrderDate = $2`
        const client = await pool.connect()
        const doneOrderData = await client.query(query, [customerID, orderDate])
        pool.end()

        return doneOrderData.rows
    }

    async getEmployeeDoneOrders(employeeID) {

        const pool = await dbConnect()
        const query = `
            SELECT
            customers.userName AS CustomerUserName,
            doneOrders.OrderDate, bookingTimes.BookTime,
            services.name, doneOrders.rating,
            doneOrders.orderCreationDate, doneOrders.longitude,
            doneOrders.latitude, doneOrders.locationName, doneOrders.price
            FROM doneOrders 
            INNER JOIN customers ON customers.ID = doneOrders.CustomerID
            INNER JOIN BookingTimes ON BookingTimes.ID = doneOrders.BookingTimeID
            INNER JOIN services ON services.ID = doneOrders.ServiceID
            WHERE EmployeeID = $1
            ORDER BY OrderDate ASC
        `
        const client = await pool.connect()
        const employeeOrders = await client.query(query, [employeeID])
        pool.end()

        return employeeOrders.rows

    }

    async getCustomerPreviousLocations(customerID) {

        const pool = await dbConnect()
        const query = `SELECT LocationName, longitude, latitude FROM doneOrders WHERE CustomerID = $1`
        const client = await pool.connect()
        const customerLocations = await client.query(query, [customerID])
        pool.end()

        return customerLocations.rows

    }

    async getAvgerageRatingForEachEmployee(ss, employeesIDs) {

        const pool = await dbConnect()
        const query = 'SELECT AVG(rating), employeeID FROM doneOrders WHERE EmployeeID IN (' + ss + ') AND OrderDate > (SELECT MIN(AccountCreationDate) FROM employees) GROUP BY employeeID ORDER BY AVG DESC'
        const client = await pool.connect()
        const employeesAverage = await client.query(query, employeesIDs)
        pool.end()

        return employeesAverage.rows
    }

    async getNoOfOrdersForThoseEmployeesFromDate(employeesIDs, ss, orderDate, orderDateSS)
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID), EmployeeID FROM doneOrders WHERE EmployeeID IN (' + ss + ') AND OrderDate >= ' + orderDateSS + ' GROUP BY EmployeeID'
        const client = await pool.connect()
        const employeeData = await client.query(query, [...employeesIDs, orderDate])
        pool.end()

        return employeeData.rows
    }

    async getCustomerOrdersFromDates(customerID, fromDate, toDate) {

        const pool = await dbConnect()
        const query = `SELECT * FROM doneOrders WHERE CustomerID = $1 AND OrderDate >= $2 AND OrderDate < $3`
        const client = await pool.connect()
        const customerPackages = await client.query(query, [customerID, fromDate, toDate])
        pool.end()

        return customerPackages.rows
    }

}

module.exports = new DoneOrder()