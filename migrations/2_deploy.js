const DBToken = artifacts.require("DBToken");
const DecentralizedBank = artifacts.require("DecentralizedBank");

module.exports = async function (deployer) {
  await deployer.deploy(DBToken);
  const dbToken = await DBToken.deployed();
  await deployer.deploy(DecentralizedBank, dbToken.address);
  const decentralizedBank = await DecentralizedBank.deployed();
  await dbToken.passMinterRole(decentralizedBank.address);
};
