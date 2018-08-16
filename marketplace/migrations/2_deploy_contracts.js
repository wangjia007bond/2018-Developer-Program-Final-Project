var Adoption = artifacts.require("Adoption");
var SimpleBank = artifacts.require("SimpleBank");

module.exports = function(deployer) {
    deployer.deploy(Adoption);
    deployer.deploy(SimpleBank);
}