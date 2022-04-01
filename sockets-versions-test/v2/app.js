const app = require('express')()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const path = require('path')

app.get('/', (request, response) => {
    return response.sendFile(path.join(__dirname + '/index.html'))
})

io.on('connection', socket => {
    console.log('socket connected')

    socket.on('init-test', data => {
        socket.emit('test', {
            message: 'hey medhat'
        })
    })
})

httpServer.listen(3001, () => console.log('web socket server started on port 3001'))