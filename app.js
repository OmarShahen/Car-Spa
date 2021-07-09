const customer = require('./models/customers')
const employee = require('./models/employees')
const admin = require('./models/admins')
const phone = require('./models/phones')




phone.setEmployeePhoneNumber(4, '01006615474', '01065630333')
.then(data=>console.log(data))
.catch(error=>console.log(error))




