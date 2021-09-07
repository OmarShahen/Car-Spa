/*

    + Can Add Customers
    + Can Read All Customers
    + Search Customers By ID
    + Search Customers By Email
    + Update Customers By Email
    + Update Customers By ID
    + Delete Customers By ID
    + Delete Customers By Email

*/                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     

const dbConnect = require('../config/db')



class Customer{

    async addCustomer(firstName, lastName, email, password, country, city, accountCreationDate){

        try{
            const pool = await dbConnect()
            const query = 'INSERT INTO customers (FirstName, LastName, email, password, country, city, accountCreationDate) VALUES ($1, $2, $3, $4, $5, $6, $7)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, password, country, city, accountCreationDate])
            pool.end()
            return true
        }
        catch(error){
             return false
        }

    }

    async getAllCustomers()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, email, country, city, accountCreationDate FROM customers'
            const client = await pool.connect()
            const customersData = await client.query(query)
            pool.end()
            return customersData.rows
        }
        catch(error){
            console.log(error.message)
            return false
        }
    }

    async getCustomersData()
    {
        try{

            const pool = await dbConnect()
            const query = `
                SELECT 
                Customers.ID, Customers.FirstName, Customers.LastName, Customers.email,
                Customers.country, Customers.City, customers.accountCreationDate
                phones.PhoneNumber
                FROM customers 
                INNER JOIN phones ON phones.CustomerID = customers.ID
            `
            const client = await pool.connect()
            const customerData = await client.query(query)
            pool.end()
            return customersData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }


    async getNoOfCustomers()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT COUNT(ID) FROM customers'
            const client = await pool.connect()
            const noOfCustomers = await client.query(query)
            pool.end()
            return noOfCustomers.rows
        }
        catch(error)
        {
            console.log(error)
            return false

        }
    }

    async getCustomerDataWithPhoneByID(customerID)
    {
        try{

            const pool = await dbConnect()
            const query = `SELECT customers.FirstName, customers.LastName, customers.email, customers.AccountCreationDate,
                            customers.country, customers.city, phones.PhoneNumber FROM customers INNER JOIN phones
                            ON phones.CustomerID = customers.ID
                            WHERE customerID = $1`
            const client = await pool.connect()
            const customersData = await client.query(query, [customerID])
            pool.end()
            return customersData.rows
        }
        catch(error)
        {
            return error
        }
    }
    async getCustomerByID(customerId)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, email, password, country, city, accountCreationDate FROM customers WHERE ID = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerId])
            pool.end()
            return customerData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getCustomerByEmail(customerEmail)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, email, password, country, city, accountCreationDate FROM customers WHERE email = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerEmail])
            pool.end()
            return customerData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerByEmailAndPassword(customerEmail, customerPassword)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, email, country, city, accountCreationDate FROM customers WHERE email = $1 AND password = $2'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerEmail, customerPassword])
            pool.end()
            return customerData
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setCustomersDataByID(customerID, email)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE customers SET email = $1 WHERE ID = $2'
            const client = await pool.connect()
            const result = await client.query(query, [email, customerID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setCustomersDataByEmail(customerEmail, firstName, lastName, email)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE customers SET FirstName = $1, LastName = $2, email = $3 WHERE email = $4'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, customerEmail])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async deleteCustomersByID(customerID)
    {
        try{
            const pool = await dbConnect()
            const query = 'DELETE FROM customers WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [customerID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async deleteCustomersByEmail(customerEmail)
    {
        try{
            const pool = await dbConnect()
            const query = 'DELETE FROM customers WHERE email = $1'
            const client = await pool.connect()
            const result = await client.query(query, [customerEmail])
            pool.end()
            return true, result
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

}

module.exports = new Customer()