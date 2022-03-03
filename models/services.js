
const dbConnect = require('../config/db')



class Service {

    async getAllServices()
    {
        const pool = await dbConnect()
        const query = 'SELECT * FROM services'
        const client = await pool.connect()
        const servicesData = await client.query(query)
        client.release()
        
        return servicesData.rows
    }

    async addService(name, price, description) {
    
        const pool = await dbConnect()
        const query = 'INSERT INTO services(name, price, description) VALUES($1, $2, $3)'
        const client = await pool.connect()
        const addedService = await client.query(query, [name, price, description])
        client.release()

        return addedService.rows
    }

    async getServiceByID(serviceID) {

        const pool = await dbConnect()
        const query = `SELECT * FROM services WHERE ID = $1`
        const client = await pool.connect()
        const serviceData = await client.query(query, [serviceID])
        client.release()

        return serviceData.rows
    }
}


module.exports = new Service()