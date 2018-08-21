pragma solidity ^0.4.13;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Marketplace.sol";

contract TestMarketplace {

    Marketplace marketplace = Marketplace(DeployedAddresses.Marketplace());

    // Testing the adopt() function
    function testUserCanAdoptPet() public {
        uint returnedId = marketplace.adopt(8);

        uint expected = 8;

        Assert.equal(returnedId, expected, "Marketplace success");
    }

    // Test for failing conditions in this contracts
    // test that every modifier is working

    // add Goods
    function testAddGoods() public {
        uint expectedCount = 1;

        marketplace.addGoods("Apple", 10, "0x88888888");
        
        Assert.equal(marketplace.goodsCount(), expectedCount, "Goods should added successfully, and the length should be 1.");
    }

    // buy Goods

    // test for failure if user does not send enough funds
    // test for purchasing an item that is not for Sale


    // shipItem

    // test for calls that are made by not the seller
    // test for trying to ship an item that is not marked Sold

    // receiveItem

    // test calling the function from an address that is not the buyer
    // test calling the function on an item not marked Shipped
}
