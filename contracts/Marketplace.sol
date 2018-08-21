pragma solidity ^0.4.17;

contract Marketplace {

    address[16] public adopters;

    // Let's make sure everyone knows who owns the TradeMyUsedStuff Website
    address public owner;

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

    // Add a variable called goodsCount to track the most recent goods
    uint public goodsCount;
    // Add a line that creates a public mapping that maps the id to an Goods.
    mapping (uint => Goods) goods;

    // Create 7 events with the same name as each possible State
    event LogForSale(uint id, uint price);
    event LogSold(uint id, uint price, address buyer);
    event LogShipped(uint id, uint price, address seller);
    event LogReceived(uint id, uint price, address buyer);
    event LogReturn(uint id, uint price, address buyer);
    event LogRShipped(uint id, uint price, address buyer);
    event LogRReceived(uint id, uint price, address seller);
    event LogFetch(uint id, string name, uint price, string ipfspic, uint status, address seller, address buyer);

    // Create a modifer that checks if the msg.sender is the owner of the contract
    modifier ownerOnly () { require (msg.sender == owner); _;}

    modifier verifyCaller (address _address) { require (msg.sender == _address); _;}

    modifier paidEnough(uint _price) { require(msg.value >= _price); _;}
    
    modifier checkValue(uint _id) {
        //refund them after pay for item (why it is before, _ checks for logic before func)
        _;
        uint _price = goods[_id].price;
        uint amountToRefund = msg.value - _price;
        goods[_id].buyer.transfer(amountToRefund);
    }
    
    /* For each of the following modifiers, use what you learned about modifiers
   to give them functionality. For example, the forSale modifier should require
   that the item with the given id has the status ForSale. */
   modifier forSale (uint id) { require(goods[id].status == Status.ForSale); _; }
   modifier sold (uint id) { require(goods[id].status == Status.Sold); _; }
   modifier shipped (uint id) { require(goods[id].status == Status.Shipped); _; }
   modifier received (uint id) { require(goods[id].status == Status.Received); _; }
   modifier returned (uint id) { require(goods[id].status == Status.Return); _; }
   modifier rshipped (uint id) { require(goods[id].status == Status.RShipped); _; }
   modifier rreceived (uint id) { require(goods[id].status == Status.RReceived); _; }

    // Constructor, can receive one or many variables here; only one allowed
    constructor() public {
        // msg provides details about the message that's sent to the contract
        // msg.sender is contract caller (address of contract creator)
        owner = msg.sender;
        goodsCount = 0;
    }

    function addGoods(string _name, uint _price, string _ipfspic) public {
        uint _id = goodsCount;
        goods[goodsCount] = Goods({id:_id, name:_name, price:_price, ipfspic:_ipfspic, status:Status.ForSale, seller:msg.sender, buyer:0});
        goodsCount += 1;
        emit LogForSale(_id, goods[_id].price);
    }

    // buy a goods
    function buyGoods(uint id) 
        public 
        payable
        forSale(id)
        paidEnough(goods[id].price)
    {
        goods[id].buyer = msg.sender;
        goods[id].status = Status.Sold;
        emit LogSold(id, goods[id].price, goods[id].buyer);
    }

    // ship a goods
    function shipGoods(uint id) 
        public
        sold(id)
        verifyCaller(goods[id].seller)
    {
        goods[id].status = Status.Shipped;
        emit LogShipped(id, goods[id].price, goods[id].seller);
    }

    // received a goods
    function receiveGoods(uint id)
        public
        shipped(id)
        verifyCaller(goods[id].buyer)
    {
        goods[id].status = Status.Received;
        goods[id].seller.transfer(goods[id].price);
        emit LogReceived(id, goods[id].price, goods[id].buyer);
    }

    function returnedGoods(uint id)
        public
        payable
        received(id)
    {
        goods[id].status = Status.Return;
        emit LogReturn(id, goods[id].price, goods[id].buyer);
    }

    function returnShipGoods(uint id) 
        public
        returned(id)
        verifyCaller(goods[id].seller)
    {
        goods[id].status = Status.RShipped;
        emit LogRShipped(id, goods[id].price, goods[id].buyer);
    }

    function returnReceiveGoods(uint id) 
        public
        rshipped(id)
        verifyCaller(goods[id].seller)   
    {
        goods[id].status = Status.RReceived;
        goods[id].buyer.transfer(goods[id].price);
        emit LogRReceived(id, goods[id].price, goods[id].seller);
    }

    function relistGoods(uint id)
        public
        rreceived(id)
        verifyCaller(goods[id].seller) 
    {
        goods[id].status = Status.ForSale;
        emit LogForSale(id, goods[id].price);
    }

    function fetchGoods(uint _id) 
    public 
    view 
    returns (uint id, string name, uint price, string ipfspic, uint state, address seller, address buyer) 
    {
        id = goods[_id].id; 
        name = goods[_id].name;
        price = goods[_id].price;
        ipfspic = goods[_id].ipfspic;
        state = uint(goods[_id].status);
        seller = goods[_id].seller;
        buyer = goods[_id].buyer;
        
        emit LogFetch(id, name, price, ipfspic, state, seller, buyer);
        return (id, name, price, ipfspic, state, seller, buyer);
    }

    // Adopting a pet
    function adopt(uint petId) public returns (uint) {

        adopters[petId] = msg.sender;

        return petId;
    }

    // Retrieving the adopters
    function getAdopters() public view returns (address[16]) {
        return adopters;
    }
}