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

const customers = require('./controllers/customers')
app.use('/api', customers)

const admins = require('./controllers/admins')
app.use('/api', admins)

const orders = require('./controllers/orders')
app.use('/api', orders)

// Socket Part
require('./socket-controller/orders')(io)

app.get('/', (request, response)=>{
    console.log(request.headers.host)
    return response.sendFile(path.join(__dirname + '/customer.html'))
})





http.listen(config.port, ()=>console.log('Server Is Running on Port', config.port))
