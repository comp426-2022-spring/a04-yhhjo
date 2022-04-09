"use strict";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Database = require('better-sqlite3')
const db = new Database("log.db");

const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);

// Check if there is a table. If row is undefined then no table exists.
let row = stmt.get();
if (row === undefined) {
    console.log('Initializing accesslog.db...');
    
    // SQL initialization string
    const sqlInit = `
        CREATE TABLE accesslog ( 
            remoteaddr TEXT,
            remoteuser TEXT, 
            time INTEGER PRIMARY KEY, 
            method TEXT,
            url TEXT,
            protocol TEXT,
            httpversion TEXT,
            status INTEGER,
            referer TEXT,
            useragent TEXT );
        `   

// Execute SQL commands above
    db.exec(sqlInit);

// Echo information about what we just did to the console.
    console.log('Your database has been initialized');
} else {
// Since the database already exists, echo that to the console.
    console.log('Database exists.')
}

export {db};