const net = require("net");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const filesDir = path.join(path.dirname(__filename), "files");

const senderConn = net.connect(9000);

senderConn.on("connect", () => {
    let size = 0,
        start = Date.now(),
        shasum = crypto.createHash("sha256"),
        buffer = "",
        state = "header",
        fileWriteStream,
        header = {},
        recvErr = null;

    senderConn.on("data", data => {
        switch (state) {
            case "header":
                buffer += data;
                let boundary = buffer.indexOf("\n");
                if (boundary !== -1) {
                    const headerJSON = buffer.substring(0, boundary);
                    buffer = buffer.substring(boundary + 1);
                    try {
                        header = JSON.parse(headerJSON);
                        let filePath = path.join(filesDir, header.fileName);
                        size += Buffer.byteLength(buffer, "utf8");
                        fileWriteStream = fs.createWriteStream(filePath);
                        fileWriteStream.write(buffer);
                        shasum.update(buffer);
                        state = "file";
                    } catch (err) {
                        recvErr = err;
                        senderConn.end();
                    }
                }
                break;
            case "file":
                size += data.length;
                fileWriteStream.write(data);
                shasum.update(data);
                break;
        }
    });

    senderConn.on("end", () => {
        let totalTimeMs = Date.now() - start,
            hash = shasum.digest("hex"),
            verified = hash === header.fileHash;
        if (recvErr === null) {
            console.log(
                `Received:\t${size}/${header.fileSize ||
                    NaN} bytes\nTime elapsed:\t${totalTimeMs} ms\nVerified:\t${verified}\nHash:\t\t${hash}`
            );
        } else {
            console.error(recvErr);
        }
        process.exit();
    });
});
