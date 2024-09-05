const { run } = require("hardhat");

// Verification of Contract
async function verify(contractAddress, args) {
  console.log("verifying Contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(error);
    }
  }
}

module.exports = {
  verify,
};
