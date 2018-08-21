var Marketplace = artifacts.require('Marketplace')

contract('Marketplace', function(accounts){
    const owner = accounts[0]
    const alice = accounts[1]
    const bob =accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    var id
    const price = web3.toWei(1, "ether")

    it("should add an goods with the provided name, price and ipfspic", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogForSale()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        const name = "iPhone"
        const ipfspic = "0x424oj2gu5k2hb3442b3"

        await marketplace.addGoods(name, price, ipfspic, {from: alice})

        const result = await marketplace.fetchGoods.call(id)

        assert.equal(result[1], name, 'the name of the last added item does not match the expected value')
        assert.equal(result[2].toString(10), price, 'the price of the last added item does not match the expected value')
        assert.equal(result[3], ipfspic, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[4].toString(10), 0, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[5], alice, 'the address adding the item should be listed as the seller')
        assert.equal(result[6], emptyAddress, 'the buyer address should be set to 0 when an item is added')
        assert.equal(eventEmitted, true, 'adding an item should emit a For Sale event')
    })
    // Test for failing conditions in this contracts
    // test that every modifier is working

    // add Goods
   // buy Goods
     // test for failure if user does not send enough funds
    // test for purchasing an item that is not for Sale


    // shipItem

    // test for calls that are made by not the seller
    // test for trying to ship an item that is not marked Sold

    // receiveItem

    // test calling the function from an address that is not the buyer
    // test calling the function on an item not marked Shipped

})