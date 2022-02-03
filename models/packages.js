
const dbConnect = require('../config/db')

class Package {

    async getPackages() {

        try {
             
            const pool = await dbConnect()
            const query = `SELECT * FROM packages`
            const client = await pool.connect()
            const packagesData = await client.query(query)
            pool.end()

            return packagesData.rows

        } catch(error) {
            console.error(error)
            return false
        }
    }
}

module.exports = new Package()