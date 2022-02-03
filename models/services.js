
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

    async addService(name, price, description) {
        
        try {

            const pool = await dbConnect()
            const query = 'INSERT INTO services(name, price, description) VALUES($1, $2, $3)'
            const client = await pool.connect()
            const addedService = await client.query(query, [name, price, description])
            pool.end()
            return addedService.rows

        } catch(error) {
            console.error(error)
            return false
        }
    }

    async getServiceByID(serviceID) {

        try {

            const pool = await dbConnect()
            const query = `SELECT * FROM services WHERE ID = $1`
            const client = await pool.connect()
            const serviceData = await client.query(query, [serviceID])
            pool.end()

            return serviceData.rows

        } catch(error) {
            console.error(error)
            return false
        }

    }
}




module.exports = new Service()