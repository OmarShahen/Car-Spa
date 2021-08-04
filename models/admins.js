
/*
    + Add Admin
    + Remove Admin
    + Update Admin
    + Read Admin By ID
    + Read Admin By Email
*/

const dbConnect = require('../config/db')
class Admin{


    async addAdmin(firstName, lastName, email, password)
    {
        try{

            pool = await dbConnect()
            const query = 'INSERT INTO admins (FirstName, LastName, email, password) VALUES ($1, $2, $3, $4)'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email, password])
            pool.end()
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

            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, Email, password FROM admins WHERE email = $1'
            const client = await pool.connect()
            const adminData = await client.query(query, [adminEmail])
            pool.end()
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
            const pool = await dbConnect()
            const query = 'SELECT ID, FirstName, LastName, email FROM admins WHERE ID = $1'
            const client = await pool.connect()
            const adminData = await client.query(query, [adminID])
            pool.end()
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
            
            const pool = await dbConnect()
            const query = 'UPDATE admins SET FirstName = $1, LastName = $2, email = $3'
            const client = await pool.connect()
            const result = await client.query(query, [firstName, lastName, email])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error.message)
            return false
        }
    }

    async setAdminPassword(newPassword, adminID)
    {
        try{
            const pool = await dbConnect()
            const query = 'UPDATE admins SET password = $1 WHERE ID = $2'
            const client = await pool.connect()
            const result = await client.query(query, [newPassword, adminID])
            pool.end()
            return true
        }
        catch(error)
        {
            return error
        }
    }

    async deleteAdmin(adminID)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM admins WHERE ID = $1'
            const client = await pool.connect()
            const result = await client.query(query, [adminID])
            pool.end()
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