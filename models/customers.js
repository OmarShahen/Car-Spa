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

const config = require('../config/config')
const { Pool } = require('pg')

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
    ssl: true,
    sslmode: 'require'
})



class Customer{

    async addCustomer(firstName, lastName, email, password, accountCreationDate){

        try{
            const query = 'INSERT INTO customers (FirstName, LastName, email, password, accountCreationDate) VALUES ($1, $2, $3, $4, $5)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, password, accountCreationDate])
            return true
        }
        catch(error){
             return false
        }

    }

    async getAllCustomers()
    {
        try{

            const query = 'SELECT ID, FirstName, LastName, email, accountCreationDate FROM customers'
            const client = await pool.connect()
            const customersData = await client.query(query)
            return customersData.rows
        }
        catch(error){
            console.log(error.message)
            return false
        }
    }

    async getCustmerByID(customerId)
    {
        try{

            const query = 'SELECT ID, FirstName, LastName, email, accountCreationDate FROM customers WHERE ID = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerId])
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

            const query = 'SELECT ID, FirstName, LastName, email, password, accountCreationDate FROM customers WHERE email = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerEmail])
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

            const query = 'SELECT ID, FirstName, LastName, email, accountCreationDate FROM customers WHERE email = $1 AND password = $2'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerEmail, customerPassword])
            return customerData
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setCustomersDataByID(customerID, firstName, lastName, email)
    {
        try{

            const query = 'UPDATE customers SET FirstName = $1, LastName = $2, email = $3 WHERE ID = $4'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, customerID])
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

            const query = 'UPDATE customers SET FirstName = $1, LastName = $2, email = $3 WHERE email = $4'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, customerEmail])
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
            const query = 'DELETE FROM customers WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [customerID])
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
            const query = 'DELETE FROM customers WHERE email = $1'
            const client = await pool.connect()
            const result = await client.query(query, [customerEmail])
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