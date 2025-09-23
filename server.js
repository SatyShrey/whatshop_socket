require("dotenv").config()
const express=require('express');
const http=require('http');
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const origin= process.env.origin
const io = new Server(server,{
    cors:{
        origin,
        methods:["GET","POST"],
        credentials:true,
    }
});

io.on('connection',(socket)=>{
    const email=socket.handshake.query.email;
    socket.join(email);
    console.log("User connected:", email);

    socket.on('send_message',(newChat)=>{
        newChat.sender=email;
        io.to(newChat.receiver).emit('receive_message',newChat);
    });

    socket.on('disconnect',()=>{
        console.log("User disconnected:", email);
    })
});


server.listen(4000,()=>{
    console.log('Server running on port 4000');
});