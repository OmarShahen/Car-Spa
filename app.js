const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const config = require('./config/config')
const flash = require('req-flash')
const session = require('express-session')





// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(fileUpload())
app.use(express.static('static'))
app.use(session({secret: config.adminSecretKey, resave: false, saveUninitialized: false}))
app.use(flash())



app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'hbs')


const auth = require('./controllers/auth')
app.use('/api/auth', auth)

const employees = require('./controllers/employees')
app.use('/api', employees)

const customers = require('./controllers/customers')
app.use('/api', customers)

const admins = require('./controllers/admins')
app.use('/api', admins)

const orders = require('./controllers/orders')
app.use('/api', orders)

const services = require('./controllers/services')
app.use('/api', services)

const packages = require('./controllers/packages')
app.use('/api', packages)

// Socket middleware
//require('./socket-middleware/auth.js')(io)


// Socket Part
require('./socket-controller/orders')(io)
require('./socket-controller/orders-beta')(io)
require('./socket-controller/notifications')(io)
require('./socket-controller/employees')(io)
require('./socket-controller/customers')(io)

io.on('connection', socket => {

    socket.on('test', (message, callback) => {
        console.log(message)
        callback({
            message: 'successful testing'
        })
    })
})

app.get('/', (request, response)=>{
    return response.sendFile(path.join(__dirname + '/customer.html'))
})

app.get('/test-socket', (request, response)=>{
    return response.sendFile(path.join(__dirname + '/test-page.html'))
})

app.get('/employee-socket', (request, response) => {
    return response.sendFile(path.join(__dirname + '/employee-socket.html'))
})

app.get('/Nassef', (request, response)=>{
    data = [
        {
            name: 'Nassef',
            age: 21
        }
    ]

    

    return response.status(200).send({
        data: data,
        data32: request.body.firstname
    })

})

http.listen(config.port, ()=>console.log('Server Is Running on Port', config.port))
