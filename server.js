// ==========================
// Server Setup (Node + Express)
// ==========================

const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Serve static from the 'public' 
app.use(express.static('public'));

// Route for root URL the main HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server 
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
