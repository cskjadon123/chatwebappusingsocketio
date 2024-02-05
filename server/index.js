import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
const port = process.env.PORT || 5000;

const users = {};

app.use(cors());

app.get("/", (req, res) => {
    res.send("HELLO, IT'S WORKING");
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined', { user: "Admin", message: `${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat, ${users[socket.id]}` });
    });

    socket.on('message', ({ message, id }) => {
        io.emit('sendMessage', { user: users[id], message, id });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('leave', { user: "Admin", message: `${users[socket.id]} has left` });
            console.log(`${users[socket.id]} has left`);
            delete users[socket.id];
        }
    });
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
