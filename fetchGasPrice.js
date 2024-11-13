const axios = require('axios');
const fs = require('fs');
const dataFile = './data/gas_price_data.json';

// Replace with actual Taiko RPC URL
const taikoRpcUrl = 'https://rpc.taiko.tools';

async function fetchGasPrice() {
  try {
    const response = await axios.post(taikoRpcUrl, {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    });
    const gasPrice = parseInt(response.data.result, 16) / 1e9; // Convert wei to gwei
    return gasPrice;
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return null;
  }
}

// Function to calculate min, max, and avg gas prices from the current data
function calculateStats(data) {
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
  
    const gasPrices = data.map(entry => entry.gasPrice);
    const maxGasPrice = Math.max(...gasPrices);
    const minGasPrice = Math.min(...gasPrices);
    const avgGasPrice = gasPrices.reduce((acc, price) => acc + price, 0) / gasPrices.length;
  
    return { max: maxGasPrice, min: minGasPrice, avg: avgGasPrice };
}

function appendData(gasPrice) {
    const timestamp = new Date().toISOString();
    const newData = { timestamp, gasPrice };
  
    let data = [];
    let stats = { min: 0, max: 0, avg: 0 };
  
    try {
      // Check if the file exists and read its content
      if (fs.existsSync(dataFile)) {
        const fileContent = fs.readFileSync(dataFile, 'utf8');
        
        // Parse only if the file is not empty
        if (fileContent) {
          const fileData = JSON.parse(fileContent);
          data = fileData.data || [];
          stats = fileData.stats || { min: 0, max: 0, avg: 0 };
        }
      }
    } catch (error) {
      console.warn('Could not parse JSON file or file is empty, initializing with empty array:', error);
      data = []; // Initialize data as an empty array if there's an error
    }
    
    // Append new data
    data.push(newData);
  
    // Calculate new stats
    stats = calculateStats(data);
  
    // Write the updated data and stats to the file
    const updatedData = {
      data: data,
      stats: stats
    };
    
    fs.writeFileSync(dataFile, JSON.stringify(updatedData, null, 2));
}

// Fetch and store data every minute
setInterval(async () => {
  const gasPrice = await fetchGasPrice();
  if (gasPrice !== null) {
    appendData(gasPrice);
    console.log(`Gas Price at ${new Date().toLocaleTimeString()}: ${gasPrice} gwei`);
  }
}, 60000); // 1 minute interval
