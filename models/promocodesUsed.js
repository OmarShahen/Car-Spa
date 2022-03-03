
const dbConnect = require('../config/db')

class PromocodeUsed {

    async getPromocodeUsed(promocode) {

        const pool = await dbConnect()
        const query = `SELECT * FROM promocodesUsed WHERE PromocodeName = $1`
        const client = await pool.connect()
        const usedPromocodeData = await client.query(query, [promocode])
        client.release()

        return usedPromocodeData.rows
    }

    async addPromocodeUsed(promocodeName, customerID, orderID) {

        const pool = await dbConnect()
        const query = `INSERT INTO promocodesUsed VALUES($1, $2, $3)`
        const client = await pool.connect()
        const assignPromocode = await client.query(query, [promocodeName, customerID, orderID])
        client.release()

        return true
    }

    async deletePromocodeUsed(orderID) {

        const pool = await dbConnect()
        const query = `DELETE FROM promocodesUsed WHERE OrderID = $1`
        const client = await pool.connect()
        const deletePromo = await client.query(query, [orderID])
        client.release()

        return true
    }

}

module.exports = new PromocodeUsed()