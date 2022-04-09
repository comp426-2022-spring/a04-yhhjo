// Import modules
import { coinFlip, coinFlips, flipACoin, countFlips } from "./modules/coin.mjs";
import { createRequire } from 'module';
import { exit } from "process";
const require = createRequire(import.meta.url);
import {db} from './modules/database.mjs'
const express = require('express')
const fs = require('fs')
const morgan = require('morgan')

const HELP = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)

// Dependencies
const args = require('minimist')(process.argv.slice(2))

if (args.help || args.h) {
    console.log(HELP)
    exit(0)
}
const HTTP_PORT = (args.port >= 1 && args.port <=65535) ? args.port : 5555
const DEBUG = args.debug
const app = express()

if (args.log!=false) {
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}
// Start an app server
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%', HTTP_PORT))
});

// Middleware function to insert logs into database
app.use((req, res, next)=> {
    // Middleware
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user, // May not work...
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }

    // SQL command to insert the above info into access log
    const stmt = db.prepare(`INSERT INTO accesslog VALUES (
                            @remoteaddr, 
                            @remoteuser, 
                            @time, 
                            @method, 
                            @url, 
                            @protocol, 
                            @httpversion, 
                            @status, 
                            @referer, 
                            @useragent)`)
    stmt.run(logdata)

    next()
});

if (DEBUG) {

    app.get('/app/log/access', (req, res) => {
        const accesses = db.prepare('SELECT * FROM accesslog').all()
        res.status(200).json(accesses)
    });

    app.get('/app/error', (req, res) => {
        throw new Error("Error test successful.")
    });
}
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

