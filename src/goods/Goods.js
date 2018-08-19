import React, { Component } from 'react'
import AdoptionContract from '../../build/contracts/Adoption.json'
import getWeb3 from '../util/getWeb3'

class Goods extends Component {
  constructor(props) {
    super(props)
    this.handleAdopt = this.handleAdopt.bind(this)
    this.web3 = null
  }

  componentWillMount() {
    // Get network provider and web3 instance. See utils/getWeb3 for more info.

    getWeb3.then(results => {
      this.setState({
        web3: results.web3
      })
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  handleAdopt(event) {
    event.preventDefault()

    console.log("this.props.id!" + this.props.id)

    var petId = this.props.id;
    console.log("Hello Duck!" + petId);
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
    var adoptionInstance;

    this.state.web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
      console.log("Hello Duck account, address:" + account);

      adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
    
        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        this.props.adoptedOnePet(this.props.id);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }  

  render() {
    return(
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="panel panel-default panel-pet">
            <div className="panel-heading">
              <h3 className="panel-title">{this.props.name}</h3>
            </div>
            <div className="panel-body">
              <img
                alt="140x140"
                data-src="holder.js/140x140"
                className="img-rounded img-center"
                src="http://localhost:8080/ipfs/QmURn9Ci7LZhJLLzocRZSzPbWkM2Dwj2NoiSxb1cmurH5Q"
                height="42" width="42"
                data-holder-rendered="true"
              />
              <strong>Breed</strong>:{" "}
              <span className="pet-breed">{this.props.goodsDescription}</span>
              <strong>Age</strong>: <span className="pet-age">{this.props.age}</span>
              <strong>Location</strong>:{" "}
              <span className="pet-location">{this.props.location}</span>
              <button
                className="btn btn-default btn-adopt"
                type="button"
                data-id="0"
                onClick={this.handleAdopt}
                disabled={this.props.adopted}
              >
                {this.props.buttonText}
              </button>
            </div>
          </div>
        </div>
    )
  }
}

export default Goods
