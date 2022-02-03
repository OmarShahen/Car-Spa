

const dbConnect = require('../config/db')


class BookingTime{


    async getAvailableTimes()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes WHERE available = TRUE ORDER BY BookTime ASC'
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

    async getAvailableTimesFromHour(hour)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes WHERE BookTime > $1 AND available = TRUE ORDER BY BookTime ASC'
            const client = await pool.connect()
            const availableTimes = await client.query(query, [hour])
            pool.end()
            return availableTimes.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getTimeIDByTime(bookTime)
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes WHERE BookTime = $1'
            const client = await pool.connect()
            const bookTimeData = await client.query(query, [bookTime])
            pool.end()
            return bookTimeData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }

    async getAvailableTimeByTime(time) {

        try {

            const pool = await dbConnect()
            const query = 'SELECT * FROM BookingTimes WHERE BookTime = $1'
            const client = await pool.connect()
            const bookTimeData = await client.query(query, [time])
            pool.end()
            return bookTimeData.rows

        } catch(error) {
            console.error(error)
            return false
        }
    }
}



module.exports = new BookingTime()