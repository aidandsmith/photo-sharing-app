const express = require('express');
const https = require('https');
const fs = require('fs');
const http = require('http');
const hsts = require('hsts'); 
const { default: helmet } = require('helmet');
const path = require('path');

const app = express();
const PORT_HTTPS = 3443; // Port for HTTPS
const PORT_HTTP = 3000; // Port for HTTP

app.use(helmet());

// Routes for photo sharing app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/index.html'));
});

app.get('/profile/id', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/profile.html'));
});

app.get('/feed', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/feed.html'));
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/index.html'));
});


const hstsOptions = {
    maxAge: 31536000, 
    includeSubDomains: true, 
    preload: true
};

http.createServer(app).listen(PORT_HTTP, () => {
    console.log(`HTTP Server running at http://localhost:${PORT_HTTP}`);
});

const sslOptions = {
    key: fs.readFileSync('private-key.pem'), 
    cert: fs.readFileSync('certificate.pem'), 
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, (req, res) => {
    hsts(hstsOptions)(req, res, () => {
        app(req, res);
    });
});

// Start HTTPS server
httpsServer.listen(PORT_HTTPS, () => {
    console.log(`HTTPS Server running at https://localhost:${PORT_HTTPS}`);
});