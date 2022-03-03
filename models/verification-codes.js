
const dbConnect = require('../config/db')

class VerificationCode{

    async createVerificationCode(phoneNumber, code)
    {

        const pool = await dbConnect()
        const query = 'INSERT INTO VerificationCodes(PhoneNumber, code) VALUES($1, $2)'
        const client = await pool.connect()
        const create = await client.query(query, [phoneNumber, code])
        client.release()

        return true
    }

    async deleteVerificationCodes(phoneNumber)
    {

        const pool = await dbConnect()
        const query = 'DELETE FROM VerificationCodes WHERE PhoneNumber = $1'
        const client  = await pool.connect()
        const deleteVerification = await client.query(query, [phoneNumber])
        client.release()
        
        return true
    }


    async getVerificationCode(phoneNumber, code)
    {

        const pool = await dbConnect()
        const query = 'SELECT * FROM VerificationCodes WHERE PhoneNumber = $1 AND code = $2'
        const client = await pool.connect()
        const data = await client.query(query, [phoneNumber, code])
        client.release()

        return data.rows
    }

    async getVerificationCodes() {

        const pool = await dbConnect()
        const query = 'SELECT * FROM VerificationCodes'
        const client = await pool.connect()
        const data = await client.query(query)
        client.release()
 
        return data.rows
    }


}


module.exports = new VerificationCode()