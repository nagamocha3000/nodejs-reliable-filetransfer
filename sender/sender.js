//server sends file

const net = require("net");
const fs = require("fs");
const path = require("path");

const filesDir = path.join(__dirname, "files");

const server = net.createServer();
server.on("connection", socket => {
    const fileReadStream = fs.createReadStream(path.join(filesDir, "file.txt"));
    fileReadStream.pipe(socket);
    fileReadStream.on("end", () => {
        socket.end();
    });
    socket.on("end", () => {
        console.log("Socket ended connection");
    });
    socket.on("error", () => {
        console.log("Receiver error: Something wrong happened");
    });
});

server.listen("9000");
