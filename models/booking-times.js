

const dbConnect = require('../config/db')


class BookingTime{


    async getAvailableTimes()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM BookingTimes WHERE available = TRUE ORDER BY BookTime ASC'
        const client = await pool.connect()
        const allAvailableTimes = await client.query(query)
        client.release()

        return allAvailableTimes.rows
    }

    async getAllBookingTimes()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM BookingTimes'
        const client = await pool.connect()
        const allTimes = await client.query(query)
        client.release()

        return allTimes.rows
    }

    async work12HourMode()
    {
        const pool = await dbConnect()
        const query = 'UPDATE BookingTimes SET available = FALSE WHERE ID >= 15'
        const client = await pool.connect()
        const isDataUpdated = await client.query(query)
        client.release()

        return true
    }
    async work24HourMode()
    {
        const pool  = await dbConnect()
        const query = 'UPDATE BookingTimes SET available = TRUE WHERE ID >= 15'
        const client = await pool.connect()
        const isDataUpdated = await client.query(query)
        client.release()

        return true
    }

    async getAvailableTimesFromHour(hour)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM BookingTimes WHERE BookTime > $1 AND available = TRUE ORDER BY BookTime ASC'
        const client = await pool.connect()
        const availableTimes = await client.query(query, [hour])
        client.release()

        return availableTimes.rows
    }

    async getTimeIDByTime(bookTime)
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM BookingTimes WHERE BookTime = $1'
        const client = await pool.connect()
        const bookTimeData = await client.query(query, [bookTime])
        client.release()

        return bookTimeData.rows
    }

    async getAvailableTimeByTime(time) {

        const pool = await dbConnect()
        const query = 'SELECT * FROM BookingTimes WHERE BookTime = $1'
        const client = await pool.connect()
        const bookTimeData = await client.query(query, [time])
        client.release()

        return bookTimeData.rows
    }
}



module.exports = new BookingTime()