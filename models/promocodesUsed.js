
const dbConnect = require('../config/db')

class PromocodeUsed {

    async getPromocodeUsed(promocode) {

        try {

            const pool = await dbConnect()
            const query = `SELECT * FROM promocodesUsed WHERE PromocodeName = $1`
            const client = await pool.connect()
            const usedPromocodeData = await client.query(query, [promocode])
            pool.end()

            return usedPromocodeData.rows

        } catch(error) {
            console.error(error)
            return false
        }
    }

    async addPromocodeUsed(promocodeName, customerID, orderID) {
         try {

            const pool = await dbConnect()
            const query = `INSERT INTO promocodesUsed VALUES($1, $2, $3)`
            const client = await pool.connect()
            const assignPromocode = await client.query(query, [promocodeName, customerID, orderID])
            pool.end()

            return true

         } catch(error) {
             console.error(error)
             return false
         }
    }

    async deletePromocodeUsed(orderID) {

        const pool = await dbConnect()
        const query = `DELETE FROM promocodesUsed WHERE OrderID = $1`
        const client = await pool.connect()
        const deletePromo = await client.query(query, [orderID])
        pool.end()

        return true
    }


}

module.exports = new PromocodeUsed()