const express = require('express')
const app = express()
const port = 8000;
const path = require('path');

// Serve a static file at root ('/')
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Display JSON data
app.get("/api/users", (req, res) => {
    res.json({firstname : 'John Doe'})
});

//Port listener
app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});
