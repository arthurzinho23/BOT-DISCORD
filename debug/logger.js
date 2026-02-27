const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs.txt");

function log(message) {
    const time = new Date().toLocaleString();

    const finalMessage = `[${time}] ${message}\n`;

    console.log(finalMessage);

    fs.appendFile(logFile, finalMessage, (err) => {
        if (err) console.error("Erro ao salvar log:", err);
    });
}

module.exports = { log };