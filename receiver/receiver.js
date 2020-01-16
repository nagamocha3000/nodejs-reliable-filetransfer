const net = require("net");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const filesDir = path.join(path.dirname(__filename), "files");

const senderConn = net.connect(9000);

senderConn.on("connect", () => {
    let size = 0;
    let start = Date.now();
    let filePath = path.join(filesDir, `file_received-${Date.now()}.txt`);
    let fileWriteStream = fs.createWriteStream(filePath);

    senderConn.on("data", chunk => {
        size += chunk.length;
        fileWriteStream.write(chunk);
    });
    senderConn.on("end", () => {
        let totalTimeMs = Date.now() - start;
        let shasum = crypto.createHash("sha256");
        let fileStream = fs.createReadStream(filePath);
        fileStream.on("data", data => {
            shasum.update(data);
        });
        fileStream.on("end", () => {
            let hash = shasum.digest("hex");
            console.log(`Received:\t${size} bytes`);
            console.log(`Time elapsed:\t${totalTimeMs} ms`);
            console.log(`Hash:\t\t${hash}`);
            process.exit();
        });
    });
});
