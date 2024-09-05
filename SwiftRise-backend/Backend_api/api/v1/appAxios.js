const axios = require('axios');
require('dotenv').config();

/**
* Axios configuration
* @author Yusuf Gbadamosi <https://github.com/ygbadamosi662>
*/

const appAx = axios.create({
  baseURL: `http://${process.env.APP_HOST}:${process.env.APP_PORT || 5000}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.APP_SECRET_KEY}`
  }
});

module.exports = { appAx };
