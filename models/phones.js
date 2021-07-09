/*
    + Add Customer Phone Number
    + Add Admin Phone Number
    + Add Employee Phone Number
    + Read Customer By Phone
    + Read Employee By Phone
    + Read Admin By Phone
    + Read Phone By Customer ID
    + Read Phone By Employee ID
    + Read Phone By Admin ID
 */


const config = require('../config/config')
const { Pool } = require('pg')

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port
})


class Phone{


    async addCustomerPhoneNumber(phoneNumber, customerID)
    {
        try{

            const query = 'INSERT INTO phones(PhoneNumber, CustomerID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, customerID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async addEmployeePhoneNumber(phoneNumber, employeeID)
    {
        try{

            const query = 'INSERT INTO phones(PhoneNumber, EmployeeID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, employeeID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async addAdminPhoneNumber(phoneNumber, adminID)
    {
        try{

            const query = 'INSERT INTO phones(PhoneNumber, adminID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, adminID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setCustomerPhoneNumber(phoneNumber, customerID)
    {
        try{
            
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE CustomerID = $2'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, customerID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async setEmployeePhoneNumber(phoneNumber, employeeID)
    {
        try{
            
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE EmployeeID = $2'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, employeeID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async setAdminPhoneNumber(phoneNumber, adminID)
    {
        try{
            
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE AdminID = $2'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, adminID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getCustomerPhoneNumber(customerID)
    {
        try{
            
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE CustomerID = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerID])
            return customerData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async getEmployeePhoneNumber(employeeID)
    {
        try{
            
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE EmployeeID = $1'
            const client = await pool.connect()
            const employeeData = await client.query(query, [employeeID])
            return employeeData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async getAdminPhoneNumber(adminID)
    {
        try{
            
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE AdminID = $1'
            const client = await pool.connect()
            const adminData = await client.query(query, [adminID])
            return adminData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async removeCustomerPhoneNumber(customerID, phoneNumber)
    {
        try{

            const query = 'DELETE FROM phones WHERE CustomerID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [customerID, phoneNumber])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async removeEmployeePhoneNumber(employeeID, phoneNumber)
    {
        try{

            const query = 'DELETE FROM phones WHERE EmployeeID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID, phoneNumber])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async removeAdminPhoneNumber(adminID, phoneNumber)
    {
        try{

            const query = 'DELETE FROM phones WHERE AdminID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [adminID, phoneNumber])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getCustomerByPhone(phoneNumber)
    {
        try{

            const query = `SELECT ID, FirstName, LastName, email, AccountCreationDate
                           FROM customers WHERE ID = (SELECT CustomerID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const customerData = await client.query(query, [phoneNumber])
            return customerData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async getEmployeeByPhone(phoneNumber)
    {
        try{

            const query = `SELECT ID, FirstName, LastName, AccountCreationDate
                           FROM employees WHERE ID = (SELECT EmployeeID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const employeeData = await client.query(query, [phoneNumber])
            return employeeData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    async getAdminByPhone(phoneNumber)
    {
        try{

            const query = `SELECT ID, FirstName, LastName, email
                           FROM admins WHERE ID = (SELECT AdminID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const adminData = await client.query(query, [phoneNumber])
            return adminData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

}

module.exports = new Phone()