const fs = require('fs').promises;
const ethers = require('ethers');
const { logger } = require('../logger');
require('dotenv').config();

async function wallet() {
    try {
        // Read the encrypted private key from the file
        const encryptedKey = await fs.readFile('./.encryptedKey.json', 'utf8');

        // import password
        const password = process.env.MAIN_KEY_PASSWORD;
        if (!password) {
            throw new Error('Password not found');
        }

        // Decrypt the private key
        const wallet = await ethers.Wallet.fromEncryptedJson(encryptedKey, password);
        return wallet;

    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.error(error.message);
            process.exit(1);
        } else {
            logger.error(error);
            process.exit(1);
        }
    }
}

module.exports = wallet;
