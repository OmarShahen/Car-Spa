

module.exports = (io)=>{

    io.on('connection', socket=>{

        // Maintenance Notification

        socket.on('maintenance:under', data =>{
            io.emit('maintenance:under', {
                message: 'app in maintenance mode'
            })
        })

        socket.on('maintenance:done', data => {
            io.emit('maintenance:done', {
                message: 'back to work'
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