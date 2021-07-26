const path = require('path')

module.exports = {
    db:{
        user: 'reda',
        host: 'localhost',
        database: 'carspa',
        password: 'reda77',
        port: 5432,
       /* username: 'doadmin',
        password: 'r4b1alncgj3qvx9i',
        host: 'db-postgresql-nyc3-88756-do-user-9140176-0.b.db.ondigitalocean.com',
        port: 25060,
        database: 'car-spa',
        sslmode: 'require',
        ssl: true*/
        
    },
    port: 5000,
    customerSecretKey: 'obgpoirhgi0h3-wojvo3jgb=034jv=-0o43nb-0gng',
    employeeSecretKey: 'obih-4g-4npgneongenvefojgldjvoejogjgjrljlr',
    adminSecretKey: 'ubf98fwnksnnbp3p3pvnpnpfneih40g-4493ncwepvnpg',
    bcryptRounds: 8,
    mailAccount: 'autocarspa77@gmail.com',
    mailAccountPassword: 'Nashar77',
    employeesFiles: '../'
}