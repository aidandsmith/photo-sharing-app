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

// Added caching middleware - **new
const staticCache = (duration) => {
    return (req, res, next) => {
        res.set('Cache-Control', `public, max-age=${duration}`);
        next();
    }
};

app.use(helmet());

const validUserIds = ['asmith', 'kfernandez', 'brichards', 'alin'];

// Middleware to check if user exists
const checkUserExists = (req, res, next) => {
    const userId = req.params.userId;
    if (validUserIds.includes(userId)) {
        next();
    } else {
        res.sendFile(path.join(__dirname, '/src/404.html'));
    }
};

// Routes for photo sharing app
// app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '/src/index.html'));
// });

app.get('/', staticCache(86400), (req, res) => {  // 24 hours
    res.sendFile(path.join(__dirname, '/src/index.html'));
}); // Added Cache with route

// app.get('/profile/:userId', checkUserExists, (req, res) => {
//     const userId = req.params.userId;
//    res.sendFile(path.join(__dirname, '/src/profile.html'));
// });

app.get('/profile/:userId', checkUserExists, (req, res) => { // No Cache
    const userId = req.params.userId;
    res.set('Cache-Control', 'no-store');  
    res.sendFile(path.join(__dirname, '/src/profile.html'));
});

// app.get('/feed', (req, res) => {
//    res.sendFile(path.join(__dirname, '/src/feed.html'));
// });

app.get('/feed', staticCache(300), (req, res) => {  // 5 minutes
    res.sendFile(path.join(__dirname, '/src/feed.html'));
});

//app.get('/post/:id', (req, res) => {
//    res.sendFile(path.join(__dirname, '/src/feed.html'));
// });

app.get('/post/:id', staticCache(3600), (req, res) => {  // 1 hour 
    res.sendFile(path.join(__dirname, '/src/feed.html'));
});

app.get('/upload', (req, res) => {
    res.set('Cache-Control', 'no-store');  // Disable caching
    res.sendFile(path.join(__dirname, '/src/index.html'));
});

// API endpoint to get all valid users
app.get('/api/users', (req, res) => { // Disable caching
    res.set('Cache-Control', 'no-store');  
    res.json(validUserIds);
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