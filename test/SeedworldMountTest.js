const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const { waffle } = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const crypto = require("crypto");
const Web3 = require("web3");

describe("SeedworldMount", function () {
    let myToken;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addr4;
    let proof;
    let proof2;
    let proof3;
    let addresses;
    let leaf;

    beforeEach(async function () {
        const MyToken = await ethers.getContractFactory("SeedworldMounts");
        // deploy with a dummy root
        [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        const web3 = new Web3("http://localhost:8545");

        // generate a Merkle tree and get the proof for addr1
        //  const addresses = [addr1.address, addr2.address, addr3.address];

        const buf2hex = (x) => ethers.utils.hexlify(x);

        const addresses = [
            {
                wallet: addr1.address,
                allocation: [1, 2, 3],
            },
            {
                wallet: addr1.address,
                allocation: [5000],
            },
        ];

        const leaves = addresses.map((x) =>
            ethers.utils.solidityKeccak256(
                ["address", "uint256[]"],
                [x.wallet, x.allocation]
            )
        );

        const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
            sortPairs: true,
        });

        root = tree.getRoot();

        console.log(buf2hex(tree.getRoot()));
        //0x54cc428ae879d4e8fe0eb82327d09ed17d85d58b32fcc49a63a3a133957fc5c9

        //-----------------------------------------------------------------

        leaf = ethers.utils.solidityKeccak256(
            ["address", "uint256[]"],
            [addr1.address, [1, 2, 3]]
        );

        const leafIndex = leaves.findIndex((x) => x === leaf);

        proof = tree.getProof(leaf, leafIndex).map((x) => buf2hex(x.data));

        const leaf2 = ethers.utils.solidityKeccak256(
            ["address", "uint256[]"],
            [addr2.address, [4, 5, 6]]
        );
        const leafIndex2 = leaves.findIndex((x) => x === leaf2);

        const leaf3 = ethers.utils.solidityKeccak256(
            ["address", "uint256[]"],
            [addr3.address, [7, 8, 9]]
        );
        const leafIndex3 = leaves.findIndex((x) => x === leaf3);
        proof2 = tree.getProof(leaf2, leafIndex2).map((x) => buf2hex(x.data));
        proof3 = tree.getProof(leaf3, leafIndex3).map((x) => buf2hex(x.data));


        //    const leaves = addresses.map((x) => ethers.utils.keccak256(x));
        //     const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
        //         sortPairs: true,
        //     });
        //     const buf2hex = (x) => "0x" + x.toString("hex");

        myToken = await MyToken.deploy(
            buf2hex(tree.getRoot()),
            "https://www.jsonkeeper.com/b/S00G"
        );
    });

    describe("safeMint()", function () {
        it("should allow only the owner to set the base URI", async function () {
            const newBaseURI = "https://new.jsonkeeper.com/";
            await expect(
                myToken.connect(addr1).setBaseURI(newBaseURI)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            await myToken.setBaseURI(newBaseURI);
            await myToken.safeMint(addr1.address, proof, [1, 2, 3]);
            await myToken.reveal();
            expect(await myToken.tokenURI(1)).to.equal(
                newBaseURI + [1] + ".json"
            );
            expect(await myToken.tokenURI(2)).to.equal(
                newBaseURI + [2] + ".json"
            );
            expect(await myToken.tokenURI(3)).to.equal(
                newBaseURI + [3] + ".json"
            );
        });

            it("should mint for multiple users and check if the URI is the same", async function () {
                const newBaseURI = "https://new.jsonkeeper.com/";
                await expect(
                    myToken.connect(addr1).setBaseURI(newBaseURI)
                ).to.be.revertedWith("Ownable: caller is not the owner");
                await myToken.setBaseURI(newBaseURI);
                await myToken.safeMint(addr1.address, proof, [1, 2, 3]);
                await myToken.safeMint(addr2.address, proof2, [4, 5, 6]);
                await myToken.safeMint(addr3.address, proof3, [7, 8, 9]);
                await myToken.reveal();
                expect(await myToken.tokenURI(1)).to.equal(
                    newBaseURI + [1] + ".json"
                );
                expect(await myToken.tokenURI(2)).to.equal(
                    newBaseURI + [2] + ".json"
                );
                expect(await myToken.tokenURI(3)).to.equal(
                    newBaseURI + [3] + ".json"
                );

                expect(await myToken.tokenURI(4)).to.equal(
                    newBaseURI + [4] + ".json"
                );
                expect(await myToken.tokenURI(5)).to.equal(
                    newBaseURI + [5] + ".json"
                );
                expect(await myToken.tokenURI(6)).to.equal(
                    newBaseURI + [6] + ".json"
                );

                expect(await myToken.tokenURI(7)).to.equal(
                    newBaseURI + [7] + ".json"
                );
                expect(await myToken.tokenURI(8)).to.equal(
                    newBaseURI + [8] + ".json"
                );
                expect(await myToken.tokenURI(9)).to.equal(
                    newBaseURI + [9] + ".json"
                );
            });

            it("should not mint a token for an invalid address", async function () {
                await expect(
                    myToken.safeMint(addr4.address, proof, [10, 11, 12])
                ).to.be.revertedWith("Not a part of Allowlist");
            });
        });

        describe("isValid()", function () {
            it("should return true if the proof is valid", async function () {
                expect(await myToken.isValid(proof, leaf)).to.equal(true);
            });

            describe("Revert safeMint()", function () {
                it("should not allow minting more tokens than available", async function () {
                    await myToken.safeMint(addr1.address, proof, [1, 2, 3]);

                    await expect(
                        myToken.safeMint(addr1.address, proof, [1, 2, 3])
                    ).to.be.revertedWith("You already minted all available mounts");
                });

                it("should not allow minting when the contract is paused", async function () {
                    await myToken.pause(true);
                    await expect(
                        myToken.safeMint(addr1.address, proof, [1, 2, 3])
                    ).to.be.revertedWith("The contract is paused");
                });

                it("should allow minting when all conditions are met", async function () {
                    await myToken.safeMint(addr1.address, proof, [1, 2, 3]);
                    const owner = await myToken.ownerOf(1);
                    expect(owner).to.equal(addr1.address);
                });
            });
        });
    });

