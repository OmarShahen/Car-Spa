const path = require('path')
const keys = require('./keys')

module.exports = {
    db:{
        user: keys.db.user,
        host: keys.db.host,
        database: keys.db.database,
        password: keys.db.password,
        port: keys.db.port,
    },
    port: keys.port,
    customerSecretKey: keys.customerSecretKey,
    employeeSecretKey: keys.employeeSecretKey,
    adminSecretKey: keys.adminSecretKey,
    bcryptRounds: keys.bcryptRounds,
    mailAccount: keys.mailAccount,
    mailAccountPassword: keys.mailAccountPassword,
    employeesFiles: keys.employeesFiles,
    twilio:{
        accountsid: keys.twilio.accountsid,
        authToken: keys.twilio.authToken
    },

    smsAPI:{
        apiKey: keys.smsAPI.apiKey,
        originator: keys.smsAPI.originator
    }
}