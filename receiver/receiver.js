const net = require("net");
const path = require("path");
const fs = require("fs");

const filesDir = path.join(path.dirname(__filename), "files");

const senderConn = net.connect(9000);

senderConn.on("connect", () => {
    let size = 0;
    let start = Date.now();
    let fileWriteStream = fs.createWriteStream(
        path.join(filesDir, `file_received-${Date.now()}.txt`)
    );
    senderConn.on("data", chunk => {
        size += chunk.length;
        fileWriteStream.write(chunk);
    });
    senderConn.on("end", () => {
        let totalTimeMs = Date.now() - start;
        console.log(`Received: ${size} bytes\nTime elapsed: ${totalTimeMs} ms`);
        process.exit();
    });
});
