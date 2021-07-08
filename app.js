const customer = require('./models/customers')
const employee = require('./models/employees')
const admin = require('./models/admins')


admin.addAdmin('Mohamed', 'Nashar', 'nashar@gmail.com', 'nashar77')
.then(result=>console.log(result))
.catch(error=>console.log(error))

