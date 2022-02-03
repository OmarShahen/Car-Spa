
const dbConnect = require('../config/db')

class CustomerPackages {

    async addCustomerPackage(customerID, packageID, registrationDate) {

        try {

            const pool = await dbConnect()
            const query = `INSERT INTO customersPackages(CustomerID, PackageID, RegistrationDate) VALUES($1, $2, $3)`
            const client = pool.connect()
            const addCustomerPackage = await client.query(query, [customerID, packageID, registrationDate])
            pool.end()

            return true
            
        } catch(error) {
            console.error(error)
            return false
        }
    }

    async getCustomerPackage(customerID) {

        try {

            const pool = await dbConnect()
            const query = `
                SELECT
                customersPackages.CustomerID, customersPackages.RegistrationDate,
                packages.name AS PackageName, packages.description AS PackageDescription, packages.price, packages.duration, packages.NoOfWashes,
                services.name AS ServiceName, services.description AS ServiceDescription, services.ID AS ServiceID
                FROM customersPackages
                INNER JOIN packages ON packages.ID = customersPackages.PackageID
                INNER JOIN services ON services.ID = packages.ServiceID
                WHERE
                CustomerID = $1
            `
            const client = await pool.connect()
            const customerPackage = await client.query(query, [customerID])
            pool.end()

            return customerPackage.rows
            
        } catch(error) {
            console.error(error)
            return false
        }
    }

}

module.exports = new CustomerPackages()