
const dbConnect = require('../config/db')


class ReservedDay{


    async addDay(dayDate)
    {
        try{

            const pool = await dbConnect()
            const query = 'INSERT INTO ReservedDays(OffDay) VALUES($1)'
            const client = await pool.connect()
            const addedDay = await client.query(query, [dayDate])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getDays()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM ReservedDays'
            const client = await pool.connect()
            const alllDays = await client.query(query)
            pool.end()
            return alllDays.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getDay(dayDate)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM ReservedDays WHERE OffDay = $1'
            const client = await pool.connect()
            const checkResult = await client.query(query, [dayDate])
            pool.end()
            return checkResult.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async removeDay(dayDate)
    {
        try{

            const pool = await dbConnect()
            const query = 'DELETE FROM ReservedDays WHERE OffDay = $1'
            const client = await pool.connect()
            const removeResult = await client.query(query, [dayDate])
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

}

module.exports = new ReservedDay()