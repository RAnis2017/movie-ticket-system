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
      
      socket.on('disconnect',(reason)=>{
        console.log(reason)
      })
    })
    
};

exports.sendMessage = (message, type, session) => {
    io.to('message-room').emit(type, message)
};