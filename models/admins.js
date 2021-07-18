
/*
    + Add Admin
    + Remove Admin
    + Update Admin
    + Read Admin By ID
    + Read Admin By Email
*/

const config = require('../config/config')
const { Pool, Client } = require('pg')

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.database,
    password: config.db.password,
    port: config.db.port,
})

class Admin{




    async addAdmin(firstName, lastName, email, password)
    {
        try{

            const query = 'INSERT INTO admins (FirstName, LastName, email, password) VALUES ($1, $2, $3, $4)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, password])
            return true

        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async getAdminByEmail(adminEmail)
    {
        try{

            const query = 'SELECT ID, FirstName, LastName, Email, password FROM admins WHERE email = $1'
            const client = await pool.connect()
            const adminData = await client.query(query, [adminEmail])
            return adminData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getAdminByID(adminID)
    {
        try{
            const query = 'SELECT ID, FirstName, LastName, email FROM admins WHERE ID = $1'
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

    async setAdminData(firstName, lastName, email)
    {
        try{
            
            const query = 'UPDATE admins SET FirstName = $1, LastName = $2, email = $3'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async deleteAdmin(adminID)
    {
        try{

            const query = 'DELETE FROM admins WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [adminID])
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

     
}

module.exports = new Admin()