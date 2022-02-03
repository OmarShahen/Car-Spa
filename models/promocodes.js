
const dbConnect = require('../config/db')

class Promocode {

    async getPromocodeByName(promocodeName) {

        try {

            const pool = await dbConnect()
            const query = `SELECT * FROM promocodes WHERE name = $1`
            const client = await pool.connect()
            const promocodeData = await client.query(query, [promocodeName])
            pool.end()

            return promocodeData.rows
            
        } catch(error) {
            console.error(error)
            return false
        }

    }

}

module.exports = new Promocode()