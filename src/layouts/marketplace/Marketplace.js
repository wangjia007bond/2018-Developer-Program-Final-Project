import React, { Component } from 'react'
import MarketplaceContract from '../../../build/contracts/Marketplace.json'
import getWeb3 from '../../util/getWeb3'
import ipfs from '../../util/ipfs'

class Marketplace extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      marketGoodsList: [],
      purchasedGoodsList: [],
      ownedGoodsList: [],
      name: '', 
      price: 0,
      ipfspic: null,
      buffer: '',
      web3: null,
      ipfs: null
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handlePrice = this.handlePrice.bind(this)
    this.handleFile = this.handleFile.bind(this)
    this.refreshGoodsList = this.refreshGoodsList.bind(this)
  }

  componentWillMount() {
  }

  componentDidMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
      this.refreshGoodsList()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
    this.setState({
      ipfs: ipfs
    })
  }

  refreshGoodsList() {
    var that = this
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    var marketplaceInstance

    this.state.web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error)
      }

      var account = accounts[0]
      var goodsCount
      console.log('Duck address is:' + account)

      marketplace.deployed().then(function(instance) {
        marketplaceInstance = instance;

        return marketplaceInstance.getAddress.call()
      }).then(function(result) {
        console.log("smart contract address:" + result)
        return marketplaceInstance.goodsCount.call()
      }).then(function(result) {
        goodsCount = result
        that.setState({ marketGoodsList: [] })
        that.setState({ purchasedGoodsList: [] })
        that.setState({ownedGoodsList: []})
        for(var i = 0; i < goodsCount; i++) {
          marketplaceInstance.fetchGoods.call(i).then(function(result) {
            const goods = {
              id: result[0].toString(10),
              name: result[1],
              price: result[2].toString(10),
              picture: 'https://ipfs.io/ipfs/' + result[3]
            }
            // add new goods to sell list
            if(result[6] === '0x0000000000000000000000000000000000000000' /*&& result[5] !== account*/) {
              that.setState({
                marketGoodsList: that.state.marketGoodsList.concat(goods)
              })
            }

            if(result[6] === account) {
              that.setState({
                purchasedGoodsList: that.state.purchasedGoodsList.concat(goods)
              })              
            }

            if(result[5] === account) {
              ownedGoodsList: that.state.ownedGoodsList.concat(goods)
            }
          })
        }
      })
    })
  }

  handleName(e) {
    this.setState({ name: e.target.value })
    console.log("handleName:" + this.state.name)
  }   

  handlePrice(e) {
    this.setState({ price: e.target.value })
    console.log("handlePrice" + this.state.price)
  }

  handleFile(e) {
    var that = this
    e.stopPropagation()
    e.preventDefault()

    const file = e.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = function() {
      const buffer = Buffer.from(reader.result)
      that.setState({
        buffer: buffer
      })
    }
  }

  handleSubmit(e) {
    var that = this
    e.preventDefault()
    if (!this.state.name.length ||  !this.state.price.length ||  !this.state.buffer.length) {
      return;
    }

    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    var marketplaceInstance
    console.log("this.state.name is:" + this.state.name)
    console.log("this.state.price is" + this.state.price)
    var name = this.state.name
    var price = this.state.price

    ipfs.add(this.state.buffer, function(err, ipfsHash) {
      console.log(err,ipfsHash)
      //setState by setting ipfsHash to ipfsHash[0].hash 
      that.setState({ 
        ipfspic: ipfsHash[0].hash 
      })

      var ipfspic = that.state.ipfspic

      that.state.web3.eth.getAccounts(function(error, accounts) {
        if(error) {
          console.log(error)
        }
    
        var account = accounts[0]
        console.log("Duck Address is:" + account)
    
        marketplace.deployed().then(function(instance) {
          marketplaceInstance = instance
          console.log("into marketplace.deployed()")
          return marketplaceInstance.addGoods(name, price, ipfspic, {from: account})
        }).then(function(result) {
          that.refreshGoodsList()
        }).catch(function(err) {
          console.log(err.message)
        })
      })
    })
  }

  render() {
    return (
      <div><br/><br/><br/>
        <h3>Add a goods which you want to sell</h3>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="name">
            Name:
          </label>
          <input
            id="name"
            onChange={this.handleName}
            value={this.state.name}
          />
          <label htmlFor="price">
            Price:
          </label>
          <input
            id="price"
            onChange={this.handlePrice}
            value={this.state.price}
          />
          <label htmlFor="picture">
            Picture:
          </label>
          <input
            type="file"
            id="picture"
            onChange={this.handleFile}
          />
          <button>
            Add Goods
          </button>
        </form>
        <h3>——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————</h3>
        <h3>All avaliable goods in our website:</h3>
        <MarketGoodsList marketGoodsList={this.state.marketGoodsList} />
        <h3>——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————</h3>
        <h3>All goods You have brought:</h3>
        <PurchasedGoodsList purchasedGoodsList={this.state.purchasedGoodsList} />
        <h3>——————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————</h3>
        <h3>All goods You want to sell:</h3>
        <OwnedGoodsList ownedGoodsList={this.state.ownedGoodsList} />
      </div>
    )
  }
}

class MarketGoodsList extends Component {

  constructor(props) {
    super(props)
    this.handleBuy = this.handleBuy.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.web3 = null
  }

  componentDidMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }
    
  getBalance (address) {
    var that = this
    return new Promise(function(resolve, reject) {
      that.state.web3.eth.getBalance(address, function(error, result) {
        if(error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  handleBuy(id, price) {
    var that = this

    console.log(id)
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    var marketplaceInstance

    this.state.web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error)
      }

      var account = accounts[0]
      console.log("Duck account address:" + account)

      that.getBalance(account).then(function(balance) {

        var accountBalance = balance.toNumber()
        marketplace.deployed().then(function(instance) {
          marketplaceInstance = instance
    
          var event = marketplaceInstance.LogSold()
          event.watch((err, res) => {
            id = res.args.id.toString(10)
            console.log("Buy goods successfully, goods id:" + id)
          })
          return marketplaceInstance.buyGoods(id, {from: account, value: price * 2})
        })
      })
    })
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.marketGoodsList.map(goods => (
            <div key={goods.id}>
              <li>Name: {goods.name}</li>
              <li>Price: {goods.price}</li>
              <img src={goods.picture} height="100" width="100"></img>
              <button
                type="button"
                data-id="0"
                onClick={(event) => {
                    event.preventDefault() 
                    this.handleBuy(goods.id, goods.price)
                }}
              >Buy Goods
              </button>
            </div>
          ))}
        </ul>
      </div>
    ); 
  }
}

class PurchasedGoodsList extends Component {

  constructor(props) {
    super(props)
    this.handleReceived = this.handleReceived.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.web3 = null
  }

  componentDidMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }
    
  getBalance (address) {
    var that = this
    return new Promise(function(resolve, reject) {
      that.state.web3.eth.getBalance(address, function(error, result) {
        if(error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  handleReceived(id) {
    var that = this

    console.log(id)
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    var marketplaceInstance

    this.state.web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error)
      }

      var account = accounts[0]
      console.log("Duck account address:" + account)

      that.getBalance(account).then(function(balance) {

        var accountBalance = balance.toNumber()
        marketplace.deployed().then(function(instance) {
          marketplaceInstance = instance
    
          var event = marketplaceInstance.LogReceived()
          event.watch((err, res) => {
            id = res.args.id.toString(10)
            console.log("Received goods successfully, goods id:" + id)
          })
          return marketplaceInstance.receiveGoods(id, {from: account})
        })
      })
    })
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.purchasedGoodsList.map(goods => (
            <div key={goods.id}>
              <li>Name: {goods.name}</li>
              <li>Price: {goods.price}</li>
              <img src={goods.picture} height="100" width="100"></img>
              <button
                type="button"
                data-id="0"
                onClick={(event) => {
                    event.preventDefault() 
                    this.handleReceived(goods.id)
                }}
              >Receive Goods
              </button>
            </div>
          ))}
        </ul>
      </div>
    ); 
  }
}

class OwnedGoodsList extends Component {

  constructor(props) {
    super(props)
    this.handleDelivery = this.handleDelivery.bind(this)
    this.getBalance = this.getBalance.bind(this)
    this.web3 = null
  }

  componentDidMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }
    
  getBalance (address) {
    var that = this
    return new Promise(function(resolve, reject) {
      that.state.web3.eth.getBalance(address, function(error, result) {
        if(error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })
  }

  handleDelivery(id, price) {
    var that = this

    console.log(id)
    const contract = require('truffle-contract')
    const marketplace = contract(MarketplaceContract)
    marketplace.setProvider(this.state.web3.currentProvider)

    var marketplaceInstance

    this.state.web3.eth.getAccounts(function(error, accounts) {
      if(error) {
        console.log(error)
      }

      var account = accounts[0]
      console.log("Duck account address:" + account)

      that.getBalance(account).then(function(balance) {

        var accountBalance = balance.toNumber()
        marketplace.deployed().then(function(instance) {
          marketplaceInstance = instance
    
          var event = marketplaceInstance.LogSold()
          event.watch((err, res) => {
            id = res.args.id.toString(10)
            console.log("Delivery goods successfully, goods id:" + id)
          })
          return marketplaceInstance.shipGoods(id, {from: account})
        })
      })
    })
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.ownedGoodsList.map(goods => (
            <div key={goods.id}>
              <li>Name: {goods.name}</li>
              <li>Price: {goods.price}</li>
              <img src={goods.picture} height="100" width="100"></img>
              <button
                type="button"
                data-id="0"
                onClick={(event) => {
                    event.preventDefault() 
                    this.handleDelivery(goods.id)
                }}
              >Delivery Goods
              </button>
            </div>
          ))}
        </ul>
      </div>
    ); 
  }
}

export default Marketplace