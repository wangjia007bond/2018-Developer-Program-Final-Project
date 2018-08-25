var Marketplace = artifacts.require('Marketplace')

contract('Marketplace', function(accounts){
    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    var id
    const price = web3.toWei(1, "ether")

    it("should allow add an goods with the provided name, price and ipfspic", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogForSale()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        const name = "iPhone"
        const ipfspic = "0x424oj2gu5k2hb3442b3"

        const goodsCount = await marketplace.addGoods(name, price, ipfspic, {from: alice})
        console.log("goods count:" + goodsCount)
        console.log("id:" + id)
        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(result[1], name, 'the name of the last added item does not match the expected value')
        assert.equal(result[2].toString(10), price, 'the price of the last added item does not match the expected value')
        assert.equal(result[3], ipfspic, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[4].toString(10), 0, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[5], alice, 'the address adding the item should be listed as the seller')
        assert.equal(result[6], emptyAddress, 'the buyer address should be set to 0 when an item is added')
        assert.equal(eventEmitted, true, 'adding an item should emit a For Sale event')
    })

    // test for failure if user does not send enough funds
    it("should not allow someone to purchase a goods with insufficient money", async() => {
        const marketplace = await Marketplace.deployed()
        const smartcontract = await marketplace.getAddress()

        const amount = web3.toWei(0.5, "ether")

        var scBalanceBefore = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance before:' + scBalanceBefore)
        console.log('bob balance before:' + bobBalanceBefore)

        try {
            await marketplace.buyGoods(id, {from: bob, value: amount})
        } catch(err) {
            console.log(err);
        }

        var scBalanceAfter = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance after:' + scBalanceAfter)
        console.log('bob balance after:' + bobBalanceAfter)

        assert.equal(scBalanceAfter, scBalanceBefore, "smart contract's balance should remain same")
        assert.isBelow(bobBalanceAfter, bobBalanceBefore, "bob's balance should decrease due to gas costs")
    })

    it("should allow someone to purchase a goods", async() => {
        const marketplace = await Marketplace.deployed()
        const smartcontract = await marketplace.getAddress()
        var eventEmitted = false

        var event = marketplace.LogSold()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        const amount = web3.toWei(2, "ether")

        console.log('smart contract address:' + owner)
        console.log('smart contract address:' + smartcontract)


        var scBalanceBefore = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance before:' + scBalanceBefore)
        console.log('bob balance before:' + bobBalanceBefore)

        await marketplace.buyGoods(id, {from: bob, value: amount})

        var scBalanceAfter = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance after:' + scBalanceAfter)
        console.log('bob balance after:' + bobBalanceAfter)

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(result[4].toString(10), 1, 'the state of the item should be "Sold", which should be declared second in the State Enum')
        assert.equal(result[6], bob, 'the buyer address should be set bob when he purchases an item')
        assert.equal(eventEmitted, true, 'selling an item should emit a Sold event')
        assert.equal(scBalanceAfter, scBalanceBefore + parseInt(price, 10), "owner's balance should be increased by the price of the item")
        assert.isBelow(bobBalanceAfter, bobBalanceBefore - parseInt(price, 10), "bob's balance should be reduced by more than the price of the item (including gas costs)")
    })

    // test for calls that are made by not the seller
    it("should not allow someone to mark the goods as shipped who is not seller", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogShipped()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        try {
            await marketplace.shipGoods(id, {from: bob})
        } catch(err) {
            console.log(err);
        }

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(eventEmitted, false, 'should not emit a Shipped event')
        assert.equal(result[4].toString(10), 1, 'the state of the item should be "Sold" remain the same')
    })

    it("should allow the seller to mark the goods as shipped", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogShipped()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        await marketplace.shipGoods(id, {from: alice})

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(eventEmitted, true, 'Shipping an item should emit a Shipped event')
        assert.equal(result[4].toString(10), 2, 'the state of the item should be "Shipped", which should be declared third in the State Enum')
    })

    // test for calls that are made by not the seller
    it("should not allow the someone to mark the goods as received who is not buyer", async() => {
        const marketplace = await Marketplace.deployed()
        const smartcontract = await marketplace.getAddress()

        var eventEmitted = false

        var event = marketplace.LogReceived()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        var scBalanceBefore = await web3.eth.getBalance(smartcontract).toNumber()
        var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber()
        console.log('smart contract balance before:' + scBalanceBefore)
        console.log('alice balance before:' + aliceBalanceBefore)

        try {
            await marketplace.receiveGoods(id, {from: alice})
        } catch(err) {
            console.log(err);
        }

        var scBalanceAfter = await web3.eth.getBalance(smartcontract).toNumber()
        var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber()
        console.log('smart contract balance after:' + scBalanceAfter)
        console.log('alice balance after:' + aliceBalanceAfter)

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(result[4].toString(10), 2, 'the state of the item should be "Shipped",remain the same')
        assert.equal(eventEmitted, false, 'should not emit a Received event')
        assert.equal(scBalanceAfter, scBalanceBefore, "smart contract's balance should remain the same")
        assert.isBelow(aliceBalanceAfter, aliceBalanceBefore, "alice's balance should remain the same")
    })

    it("should allow the buyer to mark the goods as received", async() => {
        const marketplace = await Marketplace.deployed()
        const smartcontract = await marketplace.getAddress()

        var eventEmitted = false

        var event = marketplace.LogReceived()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        var scBalanceBefore = await web3.eth.getBalance(smartcontract).toNumber()
        var aliceBalanceBefore = await web3.eth.getBalance(alice).toNumber()
        console.log('smart contract balance before:' + scBalanceBefore)
        console.log('alice balance before:' + aliceBalanceBefore)

        await marketplace.receiveGoods(id, {from: bob})

        var scBalanceAfter = await web3.eth.getBalance(smartcontract).toNumber()
        var aliceBalanceAfter = await web3.eth.getBalance(alice).toNumber()
        console.log('smart contract balance after:' + scBalanceAfter)
        console.log('alice balance after:' + aliceBalanceAfter)

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(result[4].toString(10), 3, 'the state of the item should be "Received", which should be declared second in the State Enum')
        assert.equal(eventEmitted, true, 'receiving an item should emit a Received event')
        assert.equal(scBalanceAfter, scBalanceBefore - parseInt(price, 10), "owner's balance should be increased by the price of the item")
        assert.equal(aliceBalanceAfter, aliceBalanceBefore + parseInt(price, 10), "alice's balance should be increase by the price of the item (including gas costs)")
    })

    // test for purchasing an item that is not for Sale
    it("should not allow someone to purchase a goods which is not for sale", async() => {
        const marketplace = await Marketplace.deployed()
        const smartcontract = await marketplace.getAddress()

        const amount = web3.toWei(2, "ether")

        var scBalanceBefore = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance before:' + scBalanceBefore)
        console.log('bob balance before:' + bobBalanceBefore)

        try {
            await marketplace.buyGoods(id, {from: bob, value: amount})
        } catch(err) {
            console.log(err);
        }

        var scBalanceAfter = await web3.eth.getBalance(smartcontract).toNumber()
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()
        console.log('smart contract balance after:' + scBalanceAfter)
        console.log('bob balance after:' + bobBalanceAfter)

        assert.equal(scBalanceAfter, scBalanceBefore, "smart contract's balance should remain same")
        assert.isBelow(bobBalanceAfter, bobBalanceBefore, "bob's balance should decrease due to gas costs")
    })

    it("should allow add another an goods with the provided name, price and ipfspic", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogForSale()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        const name = "iPad"
        const ipfspic = "0x424oj2gu5k2hb3442b3"

        const goodsCount = await marketplace.addGoods(name, price, ipfspic, {from: alice})
        console.log("goods count:" + goodsCount)
        console.log("id:" + id)
        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(result[1], name, 'the name of the last added item does not match the expected value')
        assert.equal(result[2].toString(10), price, 'the price of the last added item does not match the expected value')
        assert.equal(result[3], ipfspic, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[4].toString(10), 0, 'the state of the item should be "For Sale", which should be declared first in the State Enum')
        assert.equal(result[5], alice, 'the address adding the item should be listed as the seller')
        assert.equal(result[6], emptyAddress, 'the buyer address should be set to 0 when an item is added')
        assert.equal(eventEmitted, true, 'adding an item should emit a For Sale event')
    })

    // test for trying to ship an item that is not marked Sold
    it("should not allow the seller to mark the goods as shipped as the goods is not Sold", async() => {
        const marketplace = await Marketplace.deployed()

        var eventEmitted = false

        var event = marketplace.LogShipped()
        await event.watch((err, res) => {
            id = res.args.id.toString(10)
            eventEmitted = true
        })

        try {
            await marketplace.shipGoods(id, {from: alice})
        } catch(err) {
            console.log(err);
        }

        const result = await marketplace.fetchGoods.call(id)

        console.log('id:' + result[0] + ', name:' + result[1] + ', price:' + result[2] + ', ipfspic:' + result[3] + ', status:' + result[4] + ', seller:' + result[5] + ', buyer:' + result[6])

        assert.equal(eventEmitted, false, 'should not emit a Shipped event')
        assert.equal(result[4].toString(10), 0, 'the state of the item should be "ForSale", remain the same')
    })

})