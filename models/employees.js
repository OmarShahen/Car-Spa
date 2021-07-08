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



const config  = require('../config/config')
const { Pool } = require('pg')

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port
})

class Employee{

    async addEmployee(firstName, lastName, password, accountCreationDate){

        try{
            const query = 'INSERT INTO employees (FirstName, LastName, password, accountCreationDate) VALUES ($1, $2, $3, $4)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, password, accountCreationDate])
            return true
        }
        catch(error){
             return false
        }

    }

    async getAllEmployees()
    {
        try{

            const query = 'SELECT ID, FirstName, LastName, active, StillWorking, accountCreationDate FROM employees'
            const client = await pool.connect()
            const employeeData = await client.query(query)
            return employeeData.rows
        }
        catch(error){
            console.log(error.message)
            return false
        }
    }

    async getActiveEmployees()
    {
        try{

            const query = 'SELECT ID, FirstName, LastName, active FROM employees WHERE active = True'
            const client = await pool.connect()
            const employeesData = await client.query(query)
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

            const query = 'SELECT ID, FirstName, LastName, active FROM employees WHERE active = False'
            const client = await pool.connect()
            const employeesData = await client.query(query)
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

            const query = 'SELECT ID, FirstName, LastName, accountCreationDate FROM employees WHERE ID = $1'
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

    async setEmployeeDataByID(employeeID, firstName, lastName)
    {
        try{

            const query = 'UPDATE employees SET FirstName = $1, LastName = $2 WHERE ID = $3'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, employeeID])
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
            const query = 'DELETE FROM employees WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
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

            const query = 'UPDATE  employees SET StillWorking = FALSE WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
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

            const query = 'UPDATE  employees SET StillWorking = TRUE WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
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
            const query = 'UPDATE employees SET active = True WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
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
            const query = 'UPDATE employees SET active = False WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [employeeID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }


}

module.exports = new Employee()
