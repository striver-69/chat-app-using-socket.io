const path =require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocation}=require('./utils/message')
const { addUser,removeuser,getUsers,getUsersInRoom}=require('./utils/users')


//server(emit)-->client (receive) - countupdated
//client(emit)-->server (receive) - increment

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=3000||process.env.PORT
const publicDirectory=path.join(__dirname,'../public')

app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    console.log('new web socket connection')

    socket.on('join',(obj,callback)=>{

        const{error,user}=addUser({id:socket.id,username:obj.username,room:obj.room})

        if(error){
            return callback(error)
        }

        socket.join(obj.room)
        //io.to.emit -->sends message to everyone on a specific room
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(obj.room).emit('message',generateMessage('Admin',`${obj.username} has joined`))
        const User=getUsers(socket.id)
        io.to(User.room).emit('Room data',{
            room:User.room,
            users:getUsersInRoom(User.room)
        })

        callback()

    })

    socket.on("sendMessage",(response,callback)=>{
        const user=getUsers(socket.id)
        const filter=new Filter()
        if(filter.isProfane(response.mess)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,response.mess))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeuser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the room`))
        
        io.to(user.room).emit('Room data',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
    }
    })

    socket.on("sendlocation",(res,callback)=>{
        const user=getUsers(socket.id)
        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${res.loc.latitude},${res.loc.longitude}`))
        callback('Location shared')
    })

})

server.listen(port,()=>{
    console.log('Server is up on port '+port)
})