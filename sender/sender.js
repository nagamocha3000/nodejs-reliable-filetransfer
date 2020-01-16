//server sends file

const net = require("net");
const fs = require("fs");
const path = require("path");

const filesDir = path.join(__dirname, "files");

const server = net.createServer();
server.on("connection", socket => {
    const header = {
        fileName: "file.txt",
        fileHash:
            "50fe824f6cb6b0756df4a4ce786396384aa33b0b1208af74ca23b30f7ff83f22",
        fileSize: 983
    };
    socket.write(JSON.stringify(header));
    socket.write("\n");
    const fileReadStream = fs.createReadStream(
        path.join(filesDir, header.fileName)
    );
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
