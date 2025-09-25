require("dotenv").config()
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cookie = require("cookie");
const app = express();
app.use(cookieParser());
const server = http.createServer(app);
const origin = process.env.origin
const secret = process.env.secret
const io = new Server(server, {
    cors: {
        origin,
        methods: ["GET", "POST"],
        credentials: true,
    }
});


io.on('connection', (socket) => {
    try {
        const email = socket.handshake.query.email;
        const token = socket.handshake.query.token;
        socket.join(email);
        jwt.verify(token, secret);
        socket.on('send_message', (newChat) => {
            newChat.sender = email;
            io.to(newChat.receiver).emit('receive_message', newChat);
        });

        socket.on('send_otp', async (data) => {
            const res = await sendMail(data);
            io.to(data.email).emit('otp_sent', res);
        });

        socket.on('disconnect', () => {
            //console.log("User disconnected:", email);
        })
        io.to(email).emit('success', "socket connection sucsess");
    } catch (err) { io.to(socket.id).emit('error',"socket error:"+ err.message) }
});



server.listen(4000, () => {
    console.log('Server running on port 4000');
});