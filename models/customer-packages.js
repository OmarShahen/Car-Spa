
const dbConnect = require('../config/db')

class CustomerPackages {

    async addCustomerPackage(customerID, packageID, registrationDate, expirationDate) {
            
        const pool = await dbConnect()
        const query = `INSERT INTO customersPackages(CustomerID, PackageID, RegistrationDate,   ExpirationDate) VALUES($1, $2, $3, $4)`
        const client = await pool.connect()
        const addCustomerPackage = await client.query(query, [customerID, packageID, registrationDate, expirationDate])
        client.release()

        return true
    }

    async getCustomerPackage(customerID) {

        const pool = await dbConnect()
        const query = `
            SELECT
            customersPackages.CustomerID, customersPackages.RegistrationDate, customersPackages.expired
            packages.name AS PackageName, packages.description AS PackageDescription, packages.price, packages.duration, packages.NoOfWashes,
            services.name AS ServiceName, services.description AS ServiceDescription, services.ID AS ServiceID
            FROM customersPackages
            INNER JOIN packages ON packages.ID = customersPackages.PackageID
            INNER JOIN services ON services.ID = packages.ServiceID
            WHERE
            CustomerID = $1 AND expired = FALSE
        `
        const client = await pool.connect()
        const customerPackage = await client.query(query, [customerID])
        client.release()

        return customerPackage.rows
    }

    async getCustomerActivePackage(customerID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM customersPackages WHERE CustomerID = $1 AND expired = FALSE`
        const client = await pool.connect()
        const customerPackage = await client.query(query, [customerID])
        client.release()

        return customerPackage.rows
    }

    async expireCustomerPackage(customerPackageID) {

        const pool = await dbConnect()
        const query = `UPDATE customersPackages SET expired = TRUE WHERE ID = $1`
        const client = await pool.connect()
        const expirePackage = await client.query(query, [customerPackageID])
        client.release()

        return true
    }

    async getCustomerPackageWithinDates(customerID, orderDate) {

        const pool = await dbConnect()
        const query = `SELECT * FROM customersPackages WHERE RegistrationDate <= $2 AND ExpirationDate > $2 AND expired = FALSE AND CustomerID = $1`
        const client = await pool.connect()
        const customerPackage = await client.query(query, [customerID, orderDate])
        client.release()

        return customerPackage.rows
    }

}

module.exports = new CustomerPackages()