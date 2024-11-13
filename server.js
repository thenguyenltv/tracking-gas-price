const express = require('express');
const fs = require('fs');
const { spawn } = require('child_process');  // Import child_process
const app = express();
const PORT = 3000;

// Start fetchGasPrice.js as a child process
const fetchProcess = spawn('node', ['fetchGasPrice.js'], { stdio: 'inherit' });

// Handle process exit to ensure fetchProcess stops with the server
process.on('exit', () => {
  fetchProcess.kill();
});

// Serve the public directory
app.use(express.static('public'));

// Endpoint to serve gas price data
app.get('/data/gas_price_data.json', (req, res) => {
  fs.readFile('./data/gas_price_data.json', (err, data) => {
    if (err) {
      res.status(500).send('Error reading gas price data.');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    }
  });
});

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
