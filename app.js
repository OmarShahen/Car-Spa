const app = require('express')()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')



// Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(fileUpload())



const auth = require('./controllers/auth')
app.use('/api/auth', auth)

app.get('/', (request, response)=>{
    return response.send('Welcome Sir')
})






app.get('/', (request, response)=>{
    return response.status(200).send('Working Successfully')
})





const port = 3000

app.listen(port, ()=>console.log('Server Is Running on Port',port))