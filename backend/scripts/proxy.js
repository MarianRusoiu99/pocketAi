#!/usr/bin/env node

// Simple proxy for PocketBase to call Rivet bridge
const fs = require('fs');
const https = require('https');
const http = require('http');

const requestFile = process.argv[2];
const responseFile = process.argv[3];

if (!requestFile || !responseFile) {
    console.error('Usage: node proxy.js <request-file> <response-file>');
    process.exit(1);
}

try {
    // Read request data
    const requestData = JSON.parse(fs.readFileSync(requestFile, 'utf8'));
    
    // Prepare request to bridge server
    const postData = JSON.stringify(requestData);
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/execute',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 60000
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                // Write response to file
                fs.writeFileSync(responseFile, data);
                process.exit(0);
            } catch (err) {
                fs.writeFileSync(responseFile, JSON.stringify({ success: false, error: err.message }));
                process.exit(1);
            }
        });
    });

    req.on('error', (err) => {
        fs.writeFileSync(responseFile, JSON.stringify({ success: false, error: err.message }));
        process.exit(1);
    });

    req.on('timeout', () => {
        req.destroy();
        fs.writeFileSync(responseFile, JSON.stringify({ success: false, error: 'Request timeout' }));
        process.exit(1);
    });

    req.write(postData);
    req.end();

} catch (err) {
    fs.writeFileSync(responseFile, JSON.stringify({ success: false, error: err.message }));
    process.exit(1);
}
