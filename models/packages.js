
const dbConnect = require('../config/db')

class Package {

    async getPackages() {
             
        const pool = await dbConnect()
        const query = `SELECT * FROM packages`
        const client = await pool.connect()
        const packagesData = await client.query(query)
        client.release()

        return packagesData.rows
    }

    async getPackage(packageID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM packages WHERE ID = $1`
        const client = await pool.connect()
        const packageData = await client.query(query, [packageID])
        client.release()

        return packageData.rows
    }
}

module.exports = new Package()