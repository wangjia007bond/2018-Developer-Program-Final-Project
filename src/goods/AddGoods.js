import React, { Component } from 'react'
import MarketplaceContract from '../../build/contracts/Marketplace.json'
import getWeb3 from '../util/getWeb3'

class AddGoods extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            goodsList: [], 
            name: '', 
            price: 0,
            web3: null 
        }
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handlePriceChange = this.handlePriceChange.bind(this)
    }

    componentWillMount() {
        getWeb3.then(results => {
            this.setState({
                web3: results.web3
            })
        })
        .catch(() => {
            console.log('Error finding web3.')
        })
    }

    handleNameChange(e) {
        this.setState({ name: e.target.value })
        console.log("handleNameChange:" + this.state.name)
    }   

    handlePriceChange(e) {
        this.setState({ price: e.target.value })
        console.log("handlePriceChange" + this.state.price)
    }

    handleSubmit(e) {
        e.preventDefault()
        if (!this.state.name.length ||  !this.state.price.length) {
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

        this.state.web3.eth.getAccounts(function(error, accounts) {
            if(error) {
                console.log(error)
            }

            var account = accounts[0]
            console.log("Duck Address is:" + account)

            marketplace.deployed().then(function(instance) {
                marketplaceInstance = instance
                console.log("into marketplace.deployed()")
                return marketplaceInstance.addGoods(name, price, '0x123ASDe23', {from: account})
            }).then(function(result) {
            }).catch(function(err) {
                console.log(err.message)
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
                  onChange={this.handleNameChange}
                  value={this.state.name}
                />
                <label htmlFor="price">
                  Price:
                </label>
                <input
                  id="price"
                  onChange={this.handlePriceChange}
                  value={this.state.price}
                />
                <button>
                  Add Goods
                </button>
              </form>
            </div>
            (<GoodsList goodsList={this.state.goodsList} />)
            );
    }
}

class GoodsList extends Component {
    render() {
        return (
            <ul>
              {this.props.goodsList.map(goods => (
                (<li key={goods.id}>{goods.id}</li>)(<li key={goods.name}>{goods.name}</li>)(<li key={goods.price}>{goods.price}</li>)
              ))}
            </ul>
        ); 
    }
}

export default AddGoods