const ethers = require("ethers");
const { logger } = require('../logger');
const fs = require("fs");
require("dotenv").config();

/**
 * Asynchronous function that generates an encrypted JSON key using the main private key and key password, and writes it to a file.
 *
 * @return {Promise<void>} A promise that resolves when the operation is complete
 */
async function main() {
    const wallet = new ethers.Wallet(process.env.MAIN_PRIVATE_KEY);
    const encryptJsonKey = await wallet.encrypt(
        process.env.MAIN_KEY_PASSWORD
    );
    fs.writeFileSync("./.encryptedKey.json", encryptJsonKey);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        logger.error(error);
        process.exit(1);
    });
