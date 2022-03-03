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

    async addEmployee(userName, phoneNumber, address, nationalID, password, accountCreationDate){
            
        const pool = await dbConnect()
        const query = 'INSERT INTO employees (UserName, phoneNumber, address, NationalID, password, AccountCreationDate) VALUES ($1, $2, $3, $4, $5, $6)'
        const client = await pool.connect()
        const result = await client.query(query, [userName, phoneNumber, address, nationalID, password, accountCreationDate])
        client.release()

        return true
    }

    async getAllEmployees()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM employees'
        const client = await pool.connect()
        const employeeData = await client.query(query)
        client.release()

        return employeeData.rows
    }

    async getWorkingEmployees() {

        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE StillWorking = true'
        const client = await pool.connect()
        const employeesData = await client.query(query)
        client.release()

        return employeesData.rows
    }

    async getActiveEmployees()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE active = True AND StillWorking = True'
        const client = await pool.connect()
        const employeesData = await client.query(query)
        client.release()

        return employeesData.rows
    }

    async getNotActiveEmployees()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE active = False'
        const client = await pool.connect()
        const employeesData = await client.query(query)
        client.release()

        return employeesData.rows
    }

    async getEmployeeByPhoneNumber(phoneNumber) {

        const pool = await dbConnect()
        const query = `SELECT * FROM employees WHERE PhoneNumber = $1`
        const client = await pool.connect()
        const employeeData = await client.query(query, [phoneNumber])
        client.release()

        return employeeData.rows
    }

    async getEmployeeByID(employeeID)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE ID = $1'
        const client = await pool.connect()
        const employeeData = await client.query(query, [employeeID])
        client.release()

        return employeeData.rows
    }

    async getEmployeeByNationalID(nationalID){

        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE NationalID = $1'
        const client = await pool.connect()
        const employeeData = await client.query(query, [nationalID])
        client.release()
        
        return employeeData.rows
    }

    async setEmployeeDataByID(employeeID, firstName, lastName, phoneNumber, address, nationalID, criminalRecord)
    {
        const pool = await dbConnect()
        const query = 'UPDATE employees SET FirstName = $1, LastName = $2, address = $3, NationalID = $4, CriminalRecord = $5, PhoneNumber = $6 WHERE ID = $7'
        const client = await pool.connect()
        const result = await client.query(query, [firstName, lastName, address, nationalID, criminalRecord, phoneNumber, employeeID])
        client.release()

        return true
    }

    async deleteEmployeeByID(employeeID)
    {
        const pool = await dbConnect()
        const query = 'DELETE FROM employees WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [employeeID])
        client.release()

        return true
    }
    
    async removeEmployeeFromWork(employeeID)
    {
        const pool = await dbConnect()
        const query = 'UPDATE  employees SET StillWorking = FALSE WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [employeeID])
        client.release()
        
        return true
    }

    async setEmployeeToWork(employeeID)
    {
        const pool = await dbConnect()
        const query = 'UPDATE  employees SET StillWorking = TRUE WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [employeeID])
        client.release()

        return true
    }

    async setEmployeeActive(employeeID)
    {
        const pool = await dbConnect()
        const query = 'UPDATE employees SET active = True WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [employeeID])
        client.release()

        return true
    }

    async setEmployeeNotActive(employeeID)
    {
        const pool = await dbConnect()
        const query = 'UPDATE employees SET active = False WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [employeeID])
        client.release()

        return true
    }


    async getNumberOfEmployees()
    {
        const pool = await dbConnect()
        const query = 'SELECT COUNT(ID) FROM employees'
        const client = await pool.connect()
        const noOfEmployees = await client.query(query)
        client.release()

        return noOfEmployees.rows
    }

    async getMissingEmployee(ss, employeesID)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM employees WHERE ID NOT IN (' + ss + ')'
        const client = await pool.connect()
        const missingEmployee = await client.query(query, employeesID)
        client.release()
        
        return missingEmployee.rows
    }

}

module.exports = new Employee()
