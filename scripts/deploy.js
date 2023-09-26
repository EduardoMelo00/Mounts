const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");


const addresses = [
    {
        wallet: "0xd28EB68b2ad007209D08e1214cb6EcB3d7b097Ee",
        allocation: [0, 1, 2, 3, 4, 6, 7, 8, 9],
    },
    {
        wallet: "0xE333cE9678683518a1dE48B64eeb691e60d15d1d",
        allocation: [5],
    },
];

const leaves = addresses.map((x) =>
    ethers.utils.solidityKeccak256(
        ["address", "uint256"],
        [x.wallet, x.allocation]
    )
);
const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
    sortPairs: true,
});
root = tree.getRoot();

const buf2hex = (x) => "0x" + x.toString("hex");

console.log(buf2hex(tree.getRoot()));

async function deployContract() {
    const SeedworldNFT = await ethers.getContractFactory("SeedworldMountsC");
    const exampleNFT = await SeedworldNFT.deploy(
        "https://www.jsonkeeper.com/b/8JCQ"
    );
    await exampleNFT.deployed();
    const txHash = exampleNFT.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash);
    const contractAddress = txReceipt.contractAddress;
    console.log("Contract deployed to address:", contractAddress);
}

deployContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
