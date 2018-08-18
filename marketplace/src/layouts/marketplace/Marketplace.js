import React, { Component } from 'react';
import Goods from "../../goods/Goods.js";
import goods from "../../pets.json";

class MarketPlace extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props;
    this.setState({goods: goods});
  }

  componentDidMount() {
      // get the contract

  }

  adoptedOnePet(petId) {
      let goods = this.state.goods.map(goods => {
          if(goods.id == petId) {
            goods.adopted = true;
          }
          return goods;
      });
      this.setState({goods: goods});
  }

  render() {

    const goodsView = this.state.goods.map(goods => {
    return (
        <Goods 
            key={goods.id} 
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

export default MarketPlace
