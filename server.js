const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle other routes (if any)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});