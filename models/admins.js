
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
        pool = await dbConnect()
        const query = 'INSERT INTO admins (FirstName, LastName, email, password) VALUES ($1, $2, $3, $4)'
        const client = await pool.connect()
        const result = await client.query(query, [firstName, lastName, email, password])
        client.release()

        return true
    }

    async getAdminByEmail(adminEmail)
    {
        const pool = await dbConnect()
        const query = 'SELECT ID, FirstName, LastName, Email, password FROM admins WHERE email = $1'
        const client = await pool.connect()
        const adminData = await client.query(query, [adminEmail])
        client.release()

        return adminData.rows
    }

    async getAdminByID(adminID)
    {
        const pool = await dbConnect()
        const query = 'SELECT ID, FirstName, LastName, email FROM admins WHERE ID = $1'
        const client = await pool.connect()
        const adminData = await client.query(query, [adminID])
        client.release()

        return adminData.rows
    }

    async setAdminData(firstName, lastName, email)
    {            
        const pool = await dbConnect()
        const query = 'UPDATE admins SET FirstName = $1, LastName = $2, email = $3'
        const client = await pool.connect()
        const result = await client.query(query, [firstName, lastName, email])
        client.release()

        return true
    }

    async setAdminPassword(newPassword, adminID)
    {
        const pool = await dbConnect()
        const query = 'UPDATE admins SET password = $1 WHERE ID = $2'
        const client = await pool.connect()
        const result = await client.query(query, [newPassword, adminID])
        client.release()

        return true
    }

    async deleteAdmin(adminID)
    {
        const pool = await dbConnect()
        const query = 'DELETE FROM admins WHERE ID = $1'
        const client = await pool.connect()
        const result = await client.query(query, [adminID])
        client.release()

        return true
    }
    
}
module.exports = new Admin()