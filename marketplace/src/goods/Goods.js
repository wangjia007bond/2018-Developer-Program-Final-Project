import React, { Component } from 'react';

class Goods extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props;
    this.handleAdopt = this.handleAdopt.bind(this);
  }

  handleAdopt(event) {
    event.preventDefault();

    var petId = this.props.id;

    var adoptionInstance;

    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }
    
    //   var account = accounts[0];
    
    //   App.contracts.Adoption.deployed().then(function(instance) {
    //     adoptionInstance = instance;
    
    //     // Execute adopt as a transaction by sending account
    //     return adoptionInstance.adopt(petId, {from: account});
    //   }).then(function(result) {
    //     this.props.adoptedOnePet(this.props.id);
    //   }).catch(function(err) {
    //     console.log(err.message);
    //   });
    // });
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
                onClick={this.clickAdoption}
                disabled={this.props.adopted}
              >
                Adopt
              </button>
            </div>
          </div>
        </div>
    )
  }
}

export default Goods
