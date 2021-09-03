
const dbConnect = require('../config/db')



class Service{

    async getAllServices()
    {
        try{

            const pool = await dbConnect()
            const query = 'SELECT * FROM services'
            const client = await pool.connect()
            const servicesData = await client.query(query)
            pool.end()
            return servicesData.rows
        }
        catch(error)
        {
            console.log(error)
            return false
        }
    }
}




module.exports = new Service()