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
        client.release()

        return true
    }

    async addGoogleAuthCustomer(userName, email, googleID, phoneNumber, accountCreationDate) {

        const pool = await dbConnect()
        const query = `INSERT INTO customers(userName, email, googleID, phoneNumber, accountCreationDate) VALUES($1, $2, $3, $4, $5)`
        const client = await pool.connect()
        const result = await client.query(query, [userName, email, googleID, phoneNumber, accountCreationDate])
        client.release()

        return result.rows
    }


    async getCustomerByGoogleID(googleID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM customers WHERE googleID = $1`
        const client = await pool.connect()
        const result = await client.query(query, [googleID])
        client.release()

        return result.rows
    }


    // getCustomersData() is replaced by getAllCustomers()
    async getAllCustomers()
    {
        const pool = await dbConnect()
        const query = 'SELECT ID, userName, email, phoneNumber, accountCreationDate FROM customers'
        const client = await pool.connect()
        const customersData = await client.query(query)
        client.release()

        return customersData.rows
    }


    async getNoOfCustomers()
    {

        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID) FROM customers'
        const client = await pool.connect()
        const noOfCustomers = await client.query(query)
        client.release()

        return noOfCustomers.rows
    }

    async getCustomerDataWithPhoneByID(customerID)
    {

        const pool = await dbConnect()
        const query = `SELECT ID, UserName, email, password, PhoneNumber, AccountCreationDate
                        FROM customers WHERE ID = $1`
        const client = await pool.connect()
        const customersData = await client.query(query, [customerID])
        client.release()

        return customersData.rows
    }

    async getCustomerByID(customerId) {

        const pool = await dbConnect()
        const query = 'SELECT ID, userName, email, password, phoneNumber, accountCreationDate FROM customers WHERE ID = $1'
        const client = await pool.connect()
        const customerData = await client.query(query, [customerId])
        client.release()

        return customerData.rows
    }

    async getCustomerByEmail(customerEmail)
    {
        const pool = await dbConnect()
        const query = 'SELECT ID, userName, email, password, phoneNumber, accountCreationDate FROM customers WHERE email = $1'
        const client = await pool.connect()
        const customerData = await client.query(query, [customerEmail])
        client.release()

        return customerData.rows
    }

    async getCustomerByEmailAndPassword(customerEmail, customerPassword)
    {

        const pool = await dbConnect()
        const query = 'SELECT ID, userName, email, phoneNumber, accountCreationDate FROM customers WHERE email = $1 AND password = $2'
        const client = await pool.connect()
        const customerData = await client.query(query, [customerEmail, customerPassword])
        client.release()

        return customerData.rows
    }

    async setCustomersDataByID(customerID, email)
    {
        const pool = await dbConnect()
        const query = 'UPDATE customers SET email = $1 WHERE ID = $2'
        const client = await pool.connect()
        const result = await client.query(query, [email, customerID])
        client.release()

        return true
    }

    async setCustomersDataByEmail(customerEmail, userName, email)
    {

        const pool = await dbConnect()
        const query = 'UPDATE customers SET userName= $1 email = $2 WHERE email = $3'
        const client = await pool.connect()
        const result = await client.query(query, [userName, email, customerEmail])
        client.release()

        return true
    }

    async getCustomerByPhoneNumber(phoneNumber) 
    {
        const pool = await dbConnect()
        const query = `SELECT * FROM customers WHERE PhoneNumber = $1`
        const client = await pool.connect()
        const customerData = await client.query(query, [phoneNumber])
        client.release()

        return customerData.rows
    }

    async deleteCustomersByID(customerID)
    {
        const pool = await dbConnect()
        const query = 'DELETE FROM customers WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [customerID])
        client.release()

        return true
    }

    async deleteCustomersByEmail(customerEmail)
    {
        const pool = await dbConnect()
        const query = 'DELETE FROM customers WHERE email = $1'
        const client = await pool.connect()
        const result = await client.query(query, [customerEmail])
        client.release()
        
        return true, result
    }

}

module.exports = new Customer()