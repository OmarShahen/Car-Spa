

module.exports = (io)=>{

    io.on('connection', socket=>{

        // Maintenance Notification

        socket.on('maintenance', (data)=>{

            io.emit('maintenance', {
                message: 'app in maintenance mode'
            })
        })

        // Offers Notification
        socket.on('offer', data=>{
            
            io.emit('offer', {
                message: 'you got new offers'
            })
        })
    })

}