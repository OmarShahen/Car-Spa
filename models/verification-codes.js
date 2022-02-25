
const dbConnect = require('../config/db')

class VerificationCode{

    async createVerificationCode(phoneNumber, code)
    {
        try{

            const pool = await dbConnect()
            const query = 'INSERT INTO VerificationCodes(PhoneNumber, code) VALUES($1, $2)'
            const client = await pool.connect()
            const create = await client.query(query, [phoneNumber, code])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async deleteVerificationCodes(phoneNumber)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM VerificationCodes WHERE PhoneNumber = $1'
            const client  = await pool.connect()
            const deleteVerification = await client.query(query, [phoneNumber])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }


    async getVerificationCode(phoneNumber, code)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM VerificationCodes WHERE PhoneNumber = $1 AND code = $2'
            const client = await pool.connect()
            const data = await client.query(query, [phoneNumber, code])
            pool.end()
            return data.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getVerificationCodes() {

        const pool = await dbConnect()
        const query = 'SELECT * FROM VerificationCodes'
        const client = await pool.connect()
        const data = await client.query(query)
        pool.end()
        
        return data.rows
    }


}


module.exports = new VerificationCode()