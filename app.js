const app = require('express')()
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const path = require('path')
const config = require('./config/config')



// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(fileUpload())
app.use(express.static('static'))


app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'hbs')


const auth = require('./controllers/auth')
app.use('/api/auth', auth)

const customers = require('./controllers/customers')
app.use('/api', customers)

const admins = require('./controllers/admins')
app.use('/api', admins)

app.get('/', (request, response)=>{
    console.log(request.headers.host)
    return response.send('Welcome Sir')
})







app.get('/', (request, response)=>{
    return response.status(200).send('Working Successfully')
})




app.listen(config.port, ()=>console.log('Server Is Running on Port', config.port))