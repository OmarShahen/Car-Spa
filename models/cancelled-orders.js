
const dbConnect = require('../config/db')

class CancelledOrder {

    async addCancelledOrder(customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, orderCancellationDate, locationName, longitude, latitude, price) {

        const pool = await dbConnect()
        const query = `INSERT INTO cancelledOrders(
            CustomerID, EmployeeID, OrderDate, BookingTimeID,
            ServiceID, OrderCreationDate, OrderCancellationDate,
            LocationName, longitude, latitude, price
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `

        const client = await pool.connect()
        const isAdded = await client.query(query, [customerID, employeeID, orderDate, bookingTimeID, serviceID, orderCreationDate, orderCancellationDate, locationName, longitude, latitude, price])
        client.release()

        return true
    }

    async getCancelledOrdersByCustomerID(customerID) {

        const pool = await dbConnect()
        const query = `
            SELECT
            cancelledOrders.OrderDate, bookingTimes.BookTime,
            services.name, services.price, services.description,
            cancelledOrders.OrderCancellationDate, cancelledOrders.locationName,
            cancelledOrders.longitude, cancelledOrders.latitude, cancelledOrders.price
            FROM cancelledOrders
            INNER JOIN bookingTimes ON bookingTimes.ID = cancelledOrders.BookingTimeID
            INNER JOIN services ON services.ID = cancelledOrders.ServiceID
            WHERE CustomerID = $1 
        `
        const client = await pool.connect()
        const customerCancelledOrders = await client.query(query, [customerID])
        client.release()

        return customerCancelledOrders.rows
    }

    async getCancelledOrder(customerID, employeeID, orderCreationDate) {

        const pool = await dbConnect()
        const query = `SELECT * FROM cancelledOrders WHERE CustomerID = $1 AND EmployeeID = $2 AND OrderCreationDate = $3`
        const client = await pool.connect()
        const cancelledOrders = await client.query(query, [customerID, employeeID, orderCreationDate])
        client.release()

        return cancelledOrders.rows
    }

}


module.exports = new CancelledOrder()