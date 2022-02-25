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

    async addCustomer(userName, email, password, phoneNumber, accountCreationDate){

        const pool = await dbConnect()
        const query = 'INSERT INTO customers (userName, email, password, phoneNumber, accountCreationDate) VALUES ($1, $2, $3, $4, $5)'
        const client = await pool.connect()
        const result = await client.query(query, [userName, email, password, phoneNumber, accountCreationDate])
        pool.end()
        return true
    }

    async addGoogleAuthCustomer(userName, email, googleID, phoneNumber, accountCreationDate) {

        const pool = await dbConnect()
        const query = `INSERT INTO customers(userName, email, googleID, phoneNumber, accountCreationDate) VALUES($1, $2, $3, $4, $5)`
        const client = await pool.connect()
        const result = await client.query(query, [userName, email, googleID, phoneNumber, accountCreationDate])
        pool.end()
        return result.rows
    }


    // getCustomersData() is replaced by getAllCustomers()
    async getAllCustomers()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT ID, userName, email, phoneNumber, accountCreationDate FROM customers'
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
            const query = `SELECT ID, UserName, email, password, PhoneNumber, AccountCreationDate
                           FROM customers WHERE ID = $1`
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
            const query = 'SELECT ID, userName, email, password, phoneNumber, accountCreationDate FROM customers WHERE ID = $1'
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
            const query = 'SELECT ID, userName, email, password, phoneNumber, accountCreationDate FROM customers WHERE email = $1'
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
            const query = 'SELECT ID, userName, email, phoneNumber, accountCreationDate FROM customers WHERE email = $1 AND password = $2'
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

    async setCustomersDataByEmail(customerEmail, userName, email)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE customers SET userName= $1 email = $2 WHERE email = $3'
            const client = await pool.connect()
            const result = await client.query(query, [userName, email, customerEmail])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getCustomerByPhoneNumber(phoneNumber) 
    {
        try {

            const pool = await dbConnect()
            const query = `SELECT * FROM customers WHERE PhoneNumber = $1`
            const client = await pool.connect()
            const customerData = await client.query(query, [phoneNumber])
            pool.end()
            return customerData.rows
        }
        catch(error) {
            console.log(error)
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