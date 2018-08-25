pragma solidity 0.4.24;

library GoodsLib {

    /* Create a enum named status for goods, 
    contain ForSale, Sold, Shipped, Received, Return, Return Shipped and Return Received */
    enum Status { ForSale, Sold, Shipped, Received, Return, RShipped, RReceived }

    // Create a struct named Goods, contain id, name, price, state, seller, and buyer
    struct Goods {
        uint id;
        string name;
        uint price;
        string ipfspic;
        Status status;
        address seller;
        address buyer;
    }

    /* For each of the following modifiers, use what you learned about modifiers
   to give them functionality. For example, the forSale modifier should require
   that the item with the given id has the status ForSale. */
    modifier forSale(Goods storage self) { 
        require(self.status == Status.ForSale); 
        _; 
    }
    modifier sold(Goods storage self) { 
        require(self.status == Status.Sold); 
        _;
    }
    modifier shipped(Goods storage self) { 
        require(self.status == Status.Shipped); 
        _; 
    }
    modifier received(Goods storage self) { 
        require(self.status == Status.Received); 
        _; 
    }
    modifier returned(Goods storage self) { 
        require(self.status == Status.Return); 
        _;
    }
    modifier rshipped(Goods storage self) { 
        require(self.status == Status.RShipped); 
        _;
    }
    modifier rreceived(Goods storage self) {
        require(self.status == Status.RReceived); 
        _;
    }

    function addGoods(uint _id, string _name, uint _price, string _ipfspic) 
        internal
        view
        returns(Goods)
    {
        require(_price > 0, "Price must be positive and different than 0!");
        return Goods({id:_id, name:_name, price:_price, ipfspic:_ipfspic, status:Status.ForSale, seller:msg.sender, buyer:0});
    }

    // buy a goods
    function buyGoods(Goods storage self) 
        internal
        forSale(self)
    {
        self.buyer = msg.sender;
        self.status = Status.Sold;
    }

    // ship a goods
    function shipGoods(Goods storage self) 
        internal
        sold(self)
    {
        self.status = Status.Shipped;
    }

    // received a goods
    function receiveGoods(Goods storage self)
        internal
        shipped(self)
    {
        self.status = Status.Received;
        self.seller.transfer(self.price);
    }

    function returnedGoods(Goods storage self)
        internal
        received(self)
    {
        self.status = Status.Return;
    }

    function returnShipGoods(Goods storage self) 
        internal
        returned(self)
    {
        self.status = Status.RShipped;
    }

    function returnReceiveGoods(Goods storage self) 
        internal
        rshipped(self)
    {
        self.status = Status.RReceived;
        self.buyer.transfer(self.price);
    }

    function relistGoods(Goods storage self)
        internal
        rreceived(self)
    {
        self.status = Status.ForSale;
    }
}