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
    + Delete Customer Phone Number
    + Delete Employee Phone Number
    + Delete Admin Phone Number
    + Update Customer Phone Number
    + Update Employee Phone Number
    + Update Admin Phone Number
    + Read User By Phone Number
 */


const dbConnect = require('../config/db')

class Phone{


    async addCustomerPhoneNumberByID(phoneNumber, customerID)
    {
        try{

            const pool = await dbConnect()
            const query = 'INSERT INTO phones(PhoneNumber, CustomerID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, customerID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async addEmployeePhoneNumberByID(phoneNumber, employeeID)
    {
        try{

            const pool = await dbConnect()
            const query = 'INSERT INTO phones(PhoneNumber, EmployeeID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async addAdminPhoneNumberByID(phoneNumber, adminID)
    {
        try{

            const pool = await dbConnect()
            const query = 'INSERT INTO phones(PhoneNumber, adminID) VALUES($1, $2)'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber, adminID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async setCustomerPhoneNumber(customerID, oldPhoneNumber, newPhoneNumber)
    {
        try{
            
            const pool = await dbConnect()
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE CustomerID = $2 AND PhoneNumber = $3'
            const client = await pool.connect()
            const result = await client.query(query, [newPhoneNumber, customerID, oldPhoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async setEmployeePhoneNumber(employeeID, oldPhoneNumber, newPhoneNumber)
    {
        try{
            
            const pool = await dbConnect()
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE EmployeeID = $2 AND PhoneNumber = $3'
            const client = await pool.connect()
            const result = await client.query(query, [newPhoneNumber, employeeID, oldPhoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async setAdminPhoneNumber(adminID, oldPhoneNumber, newPhoneNumber)
    {
        try{
            
            const pool = await dbConnect()
            const query = 'UPDATE phones SET PhoneNumber = $1 WHERE AdminID = $2 AND PhoneNumber = $3'
            const client = await pool.connect()
            const result = await client.query(query, [newPhoneNumber, adminID, oldPhoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerPhoneNumber(customerID)
    {
        try{
            
            const pool = await dbConnect()
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE CustomerID = $1'
            const client = await pool.connect()
            const customerData = await client.query(query, [customerID])
            pool.end()
            return customerData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async getEmployeePhoneNumber(employeeID)
    {
        try{
            
            const pool = await dbConnect()
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE EmployeeID = $1'
            const client = await pool.connect()
            const employeeData = await client.query(query, [employeeID])
            pool.end()
            return employeeData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async getAdminPhoneNumber(adminID)
    {
        try{

            const pool = await dbConnect()    
            const query = 'SELECT ID, PhoneNumber FROM phones WHERE AdminID = $1'
            const client = await pool.connect()
            const adminData = await client.query(query, [adminID])
            pool.end()
            return adminData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async removeCustomerPhoneNumber(customerID, phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM phones WHERE CustomerID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [customerID, phoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async removeEmployeePhoneNumber(employeeID, phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM phones WHERE EmployeeID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID, phoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async removeAdminPhoneNumber(adminID, phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM phones WHERE AdminID = $1 AND PhoneNumber = $2'
            const client = await pool.connect()
            const result = await client.query(query, [adminID, phoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getCustomerByPhone(phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = `SELECT ID, FirstName, LastName, email, AccountCreationDate
                           FROM customers WHERE ID = (SELECT CustomerID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const customerData = await client.query(query, [phoneNumber])
            pool.end()
            return customerData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async getEmployeeByPhone(phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = `SELECT ID, FirstName, LastName, password, NationalID, AccountCreationDate
                           FROM employees WHERE ID = (SELECT EmployeeID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const employeeData = await client.query(query, [phoneNumber])
            pool.end()
            return employeeData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
    async getAdminByPhone(phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = `SELECT ID, FirstName, LastName, email
                           FROM admins WHERE ID = (SELECT AdminID FROM phones WHERE PhoneNumber = $1)`
            const client = await pool.connect()
            const adminData = await client.query(query, [phoneNumber])
            pool.end()
            return adminData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async checkPhoneNumberExist(phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM phones WHERE PhoneNumber = $1'
            const client = await pool.connect()
            const result = await client.query(query, [phoneNumber])
            pool.end()
            return result.rows
        }
        catch(error)
        {
            console.log(error)
        }
    }

}

module.exports = new Phone()