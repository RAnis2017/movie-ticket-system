let io;
exports.socketConnection = (server, app) => {
    const socketIo = require('socket.io')
    io = socketIo(server,{ 
        cors: {
          origin: '*'
        }
    }) //in case server and client run on different urls
    io.on('connection',(socket)=>{
      console.log('client connected: ',socket.id)
      
      socket.join('message-room')

      socket.emit('connection', 'Welcome to iMovies')
      
      socket.on('ticket-selected', (payload) => {
        console.log('seat selected: ', payload)
        socket.broadcast.emit('ticket-selected', payload)
      })

      socket.on('ticket-deselected', (payload) => {
        console.log('seat deselected: ', payload)
        socket.broadcast.emit('ticket-deselected', payload)
      })

      socket.on('disconnect-without-buy', (payload) => {
        console.log('disconnect-without-buy', payload)
        socket.broadcast.emit('disconnect-without-buy', payload)
      })

      socket.on('disconnect',(reason)=>{
        console.log(reason)
      })
    })
    
};

exports.sendMessage = (message, type, session) => {
    io.to('message-room').emit(type, message)
};