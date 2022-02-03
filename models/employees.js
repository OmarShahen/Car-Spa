/*
    + Add Employee
    + Read All Employees
    + Read Active Employees
    + Read Not Active Employees
    + Set Employee Active
    + Set Employee Not Active
    + Read Employee By ID
    + Delete Employee By ID
    + Set Employee To Work
    + Remove Employee From Work
*/ 

const dbConnect = require('../config/db')

class Employee{

    async addEmployee(firstName, lastName, phoneNumber, address, nationalID,password, criminalRecord,accountCreationDate){

        try{
            
            const pool = await dbConnect()
            const query = 'INSERT INTO employees (FirstName, LastName, PhoneNumber, address, NationalID, password, CriminalRecord, AccountCreationDate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, phoneNumber, address, nationalID, password, criminalRecord, accountCreationDate])
            pool.end()
            return true
        }
        catch(error){
            console.log(error)
             return false
        }

    }

    async getAllEmployees()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees'
            const client = await pool.connect()
            const employeeData = await client.query(query)
            pool.end()
            return employeeData.rows
        }
        catch(error){
            console.log(error.message)
            return false
        }
    }

    async getWorkingEmployees() {

        try {

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE StillWorking = true'
            const client = await pool.connect()
            const employeesData = await client.query(query)
            pool.end()
            return employeesData.rows

        } catch(error) {
            console.error(error)
            return false
        }
    }

    async getActiveEmployees()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE active = True AND StillWorking = True'
            const client = await pool.connect()
            const employeesData = await client.query(query)
            pool.end()
            return employeesData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getNotActiveEmployees()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE active = False'
            const client = await pool.connect()
            const employeesData = await client.query(query)
            pool.end()
            return employeesData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getEmployeeByID(employeeID)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE ID = $1'
            const client = await pool.connect()
            const employeeData = await client.query(query, [employeeID])
            pool.end()
            return employeeData.rows
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getEmployeeByNationalID(nationalID){

        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE NationalID = $1'
            const client = await pool.connect()
            const employeeData = await client.query(query, [nationalID])
            pool.end()
            return employeeData.rows
        }
        catch(error)
        {   
            console.log(error.message)
            return false
        }
    }

    async setEmployeeDataByID(employeeID, firstName, lastName, phoneNumber, address, nationalID, criminalRecord)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE employees SET FirstName = $1, LastName = $2, address = $3, NationalID = $4, CriminalRecord = $5, PhoneNumber = $6 WHERE ID = $7'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, address, nationalID, criminalRecord, phoneNumber, employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async deleteEmployeeByID(employeeID)
    {
        try{
            const pool = await dbConnect()
            const query = 'DELETE FROM employees WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }
    
    async removeEmployeeFromWork(employeeID)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE  employees SET StillWorking = FALSE WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setEmployeeToWork(employeeID)
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE  employees SET StillWorking = TRUE WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setEmployeeActive(employeeID)
    {
        try{
            const pool = await dbConnect()
            const query = 'UPDATE employees SET active = True WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setEmployeeNotActive(employeeID)
    {
        try{
            const pool = await dbConnect()
            const query = 'UPDATE employees SET active = False WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }


    async getNumberOfEmployees()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT COUNT(ID) FROM employees'
            const client = await pool.connect()
            const noOfEmployees = await client.query(query)
            pool.end()
            return noOfEmployees.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getMissingEmployee(ss, employeesID)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM employees WHERE ID NOT IN (' + ss + ')'
            const client = await pool.connect()
            const missingEmployee = await client.query(query, employeesID)
            pool.end()
            return missingEmployee.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

}

module.exports = new Employee()
