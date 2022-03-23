const app = require('express')()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)

io.on('connection', socket => {
    console.log('socket connected')
})

httpServer.listen(3001, () => console.log('web socket server started on port 3001'))