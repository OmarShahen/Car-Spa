const customer = require('./models/customers')
const employee = require('./models/employees')





employee.setEmployeeToWork(5)
.then(data=>console.log(data))

employee.getAllEmployees()
.then(data=>console.log(data))