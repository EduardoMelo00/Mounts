require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");

const dotenv = require("dotenv");
dotenv.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
            {
                version: "0.8.9",
            },
            {
                version: "0.8.0",
            },
            {
                version: "0.5.16",
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hardhat: {
            forking: {
                url: process.env.FORKING_ENDPOINT,
            },
        },
        goerli: {
            url: process.env.GOERLI_ENDPOINT,
            accounts: [process.env.DEPLOY_ACCOUNT_ETH_PRIVATE_KEY],
            gasPrice: 30000000000,
        },
        bsctestnet: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
            accounts: [process.env.PRIVATE_KEY],
        },
        sepolia: {
            url: process.env.SEPOLIA_ENDPOINT,
            accounts: [process.env.DEPLOY_ACCOUNT_ETH_PRIVATE_KEY],
            gasPrice: 90000000000,
        },
        mumbai: {
            url: process.env.MUMBAI_ENDPOINT,
            accounts: [process.env.DEPLOY_ACCOUNT_ETH_PRIVATE_KEY],
            gasPrice: 30000000000,
        },
        goerlibkp: {
            url: process.env.GOERLI_ENDPOINT,
            accounts: {
                mnemonic: process.env.SEED,
            },
            gasPrice: 90000000000,
        },
        mainnet: {
            url: process.env.MAINNET_ENDPOINT,
            accounts: [process.env.Seedify_PK],
            gasPrice: 38000000000,
        },
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_KEY,
    },
};
