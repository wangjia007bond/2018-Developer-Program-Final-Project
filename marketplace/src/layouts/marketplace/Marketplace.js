import React, { Component } from 'react';
import Goods from "../../goods/Goods.js";
import goods from "../../pets.json";

class MarketPlace extends Component {
  constructor(props, { authData }) {
    super(props)
    authData = this.props
  }

  render() {

    const goodsView = goods.map(goods => {
        return <Goods key={goods.id} name={goods.name} age={goods.age} breed={goods.breed} location={goods.location} />;
    })
    return(
        <div id="petsRow" className="row">
            {goodsView}
        </div>
    )
  }
}

export default MarketPlace
