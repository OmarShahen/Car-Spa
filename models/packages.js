
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

    async getPackage(packageID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM packages WHERE ID = $1`
        const client = await pool.connect()
        const packageData = await client.query(query, [packageID])
        pool.end()

        return packageData.rows

    }
}

module.exports = new Package()