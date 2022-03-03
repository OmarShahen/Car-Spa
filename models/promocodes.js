
const dbConnect = require('../config/db')

class Promocode {

    async getPromocodeByName(promocodeName) {

        const pool = await dbConnect()
        const query = `SELECT * FROM promocodes WHERE name = $1`
        const client = await pool.connect()
        const promocodeData = await client.query(query, [promocodeName])
        client.release()

        return promocodeData.rows
    }

}

module.exports = new Promocode()