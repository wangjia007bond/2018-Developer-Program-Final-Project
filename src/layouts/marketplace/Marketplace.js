import React, { Component } from 'react';
import Goods from "../../goods/Goods.js";
import AdoptionContract from '../../../build/contracts/Adoption.json'
import goodsListData from "../../pets.json";
import getWeb3 from '../../util/getWeb3'

class Marketplace extends Component {
  constructor(props) {
    super(props)
    this.state = {goodsList: []}
    this.web3 = null
  }

  componentDidMount() {
    this.setState({goodsList: goodsListData})
    // Get network provider and web3 instance. See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const adoption = contract(AdoptionContract)
    adoption.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on Adoption.
    var adoptionInstance
    var newGoodList = this.state.goodsList

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {

      adoption.deployed().then((instance) => {
        adoptionInstance = instance

        // Stores a given value, 5 by default.
        return adoptionInstance.getAdopters.call()
      }).then((adopters) => {
        // Get the value from the contract to prove it worked.
        for (var i = 0; i < adopters.length; i++) {
            if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
              newGoodList[i].adopted = true
            } else {
              newGoodList[i].adopted = false
            }
        }
      }).then((result) => {
        // Update state with the result.
        return this.setState({goodsList: newGoodList})
      })
    })  
  }

  adoptedOnePet(petId) {
      console.log("Hello World!");
      let newGoodsList = this.state.goodsList.map(goods => {
          if(goods.id === petId) {
            goods.adopted = true;
          }
          return goods;
      });
      this.setState({goodsList: newGoodsList});
  }

  render() {

    const goodsView = this.state.goodsList.map(goods => {
    return (
        <Goods 
            key={goods.id} 
            id={goods.id}
            name={goods.name} 
            age={goods.age} 
            breed={goods.breed} 
            location={goods.location} 
            adaptedOnePet={this.adoptedOnePet}
            adopted={goods.adopted}
            />
        );
    });
    return(
        <div id="petsRow" className="row">
            {goodsView}
        </div>
    )
  }
}

export default Marketplace
