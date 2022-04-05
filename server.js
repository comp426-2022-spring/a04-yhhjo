// Import coin module
import { coinFlip, coinFlips, flipACoin, countFlips } from "./modules/coin.mjs";
import { createRequire } from 'module';
import { getSystemErrorMap } from "util";
import { exit } from "process";
const require = createRequire(import.meta.url);
const HELP = "server.js [options]\n\n--port\t\tSet the port number for the server to listen on. Must be an integer between 1 and 65535.\n\n" +
            "--debug\t\tIf set to `true`, creates endlpoints /app/log/access/ which returns\n" +
            "\t\ta JSON access log from the database and /app/error which throws \n\t\tan error with the message \"Error test successful.\" Defaults to `false`.\n\n"+
            "--log		If set to false, no log files are written. Defaults to true. Logs are always written to database.\n\n" +
            "--help\t\tReturn this message and exit."


// Dependencies
const args = require('minimist')(process.argv.slice(2))
if (args.help) {
    console.log(HELP)
    exit(0)
}
const HTTP_PORT = process.argv.slice(2).port || 5000
// Run with argument "--help"

const express = require('express')
const app = express()

// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
});

// Check endpoint /app/flip/call/heads/
app.get('/app/flip/call/heads/', (req, res)=> {
    // Respond with status 200
    res.statusCode = 200;
    res.statusMessage = "OK"
    // Write JSON object
    res.json(flipACoin("heads"))
});

// Check endpoint /app/flip/call/tails/
app.get('/app/flip/call/tails/', (req, res)=> {
    // Respond with status 200
    res.statusCode = 200;
    res.statusMessage = "OK"
    // Write JSON object
    res.json(flipACoin("tails"))
});

// Check endpoint /app/flips/param:[number]
app.get('/app/flips/:number', (req, res)=> {
    const raw = coinFlips(req.params.number)
    const summary = countFlips(raw)
    const response = {
        raw: raw, 
        summary: summary
    }
    // Respond with status 200
    res.statusCode = 200;
    res.statusMessage = "OK"
    // Write JSON object
    res.json(response)
});

// Check endpoint /app/flip/
app.get('/app/flip/', (req, res)=> {
    // Respond with status 200
    res.statusCode = 200;
    res.statusMessage = "OK"
    // Write JSON object
    res.json(coinFlip())
});

// Check endpoint /app/
app.get('/app/', (req, res) => {
    // Respond with status 200
    res.statusCode = 200;
    // Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
    res.end(res.statusCode + ' ' + res.statusMessage)
});

// Default response for any request
app.use(function (req, res) {
    res.status(404).send('404 NOT FOUND')
});

