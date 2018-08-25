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
    {
        self.buyer = msg.sender;
        self.status = Status.Sold;
    }

    // ship a goods
    function shipGoods(Goods storage self) 
        internal
    {
        self.status = Status.Shipped;
    }

    // received a goods
    function receiveGoods(Goods storage self)
        internal
    {
        self.status = Status.Received;
        self.seller.transfer(self.price);
    }

    function returnedGoods(Goods storage self)
        internal
    {
        self.status = Status.Return;
    }

    function returnShipGoods(Goods storage self) 
        internal
    {
        self.status = Status.RShipped;
    }

    function returnReceiveGoods(Goods storage self) 
        internal
    {
        self.status = Status.RReceived;
        self.buyer.transfer(self.price);
    }

    function relistGoods(Goods storage self)
        internal
    {
        self.status = Status.ForSale;
    }
}