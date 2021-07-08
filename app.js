const customer = require('./models/customers')

customer.deleteCustomersByEmail('ahmed@gmail.com').then(data=>console.log(data))




