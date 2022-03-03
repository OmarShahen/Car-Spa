
const dbConnect = require('../config/db')


class ReservedDay {


    async addDay(dayDate)
    {
        const pool = await dbConnect()
        const query = 'INSERT INTO ReservedDays(OffDay) VALUES($1)'
        const client = await pool.connect()
        const addedDay = await client.query(query, [dayDate])
        client.release()

        return true        
    }

    async getDays()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM ReservedDays'
        const client = await pool.connect()
        const alllDays = await client.query(query)
        client.release()

        return alllDays.rows
    }

    async getDay(dayDate)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM ReservedDays WHERE OffDay = $1'
        const client = await pool.connect()
        const checkResult = await client.query(query, [dayDate])
        client.release()

        return checkResult.rows  
    }

    async removeDay(dayDate)
    {
        const pool = await dbConnect()
        const query = 'DELETE FROM ReservedDays WHERE OffDay = $1'
        const client = await pool.connect()
        const removeResult = await client.query(query, [dayDate])
        client.release()

        return true
    }

}

module.exports = new ReservedDay()