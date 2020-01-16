const net = require("net");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const filesDir = path.join(path.dirname(__filename), "files");

const senderConn = net.connect(9000);

senderConn.on("connect", () => {
    let size = 0,
        start = Date.now(),
        filePath = path.join(filesDir, `file_received-${Date.now()}.txt`),
        fileWriteStream = fs.createWriteStream(filePath),
        shasum = crypto.createHash("sha256");

    senderConn.on("data", chunk => {
        size += chunk.length;
        fileWriteStream.write(chunk);
        shasum.update(chunk);
    });

    senderConn.on("end", () => {
        let totalTimeMs = Date.now() - start,
            hash = shasum.digest("hex");
        console.log(
            `Received:\t${size} bytes\nTime elapsed:\t${totalTimeMs} ms\nHash:\t\t${hash}`
        );
        process.exit();
    });
});
