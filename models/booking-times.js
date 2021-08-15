

const dbConnect = require('../config/db')


class BookingTime{


    async getAvailableTimes()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes WHERE available = TRUE'
            const client = await pool.connect()
            const allAvailableTimes = await client.query(query)
            pool.end()
            return allAvailableTimes.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getAllBookingTimes()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes'
            const client = await pool.connect()
            const allTimes = await client.query(query)
            pool.end()
            return allTimes.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async work12HourMode()
    {
        try{

            const pool = await dbConnect()
            const query = 'UPDATE BookingTimes SET available = FALSE WHERE ID >= 15'
            const client = await pool.connect()
            const isDataUpdated = await client.query(query)
            pool.end()
            return true
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }


    async work24HourMode()
    {
        try{

            const pool  = await dbConnect()
            const query = 'UPDATE BookingTimes SET available = TRUE WHERE ID >= 15'
            const client = await pool.connect()
            const isDataUpdated = await client.query(query)
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



module.exports = new BookingTime()