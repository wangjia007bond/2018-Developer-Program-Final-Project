pragma solidity ^0.4.23;

import "./common/Destructible.sol";
import "./common/Pausable.sol";
import "./libs/GoodsLib.sol";

contract Marketplace is Destructible, Pausable {

    using GoodsLib for GoodsLib.Goods;

    // Let's make sure everyone knows who owns the TradeMyUsedStuff Website
    address public owner;
    // Add a variable called goodsCount to track the most recent goods
    uint public goodsCount;
    // Add a line that creates a public mapping that maps the id to an Goods.
    mapping(uint => GoodsLib.Goods) goodsList;

    // Create 4 events with the same name as each possible State
    event LogForSale(uint id, uint price);
    event LogSold(uint id, uint price, address buyer);
    event LogShipped(uint id, uint price, address seller);
    event LogReceived(uint id, uint price, address buyer);
    event LogFetch(uint id, string name, uint price, string ipfspic, uint status, address seller, address buyer);

    modifier verifyCaller(address _address) { 
        require (msg.sender == _address); 
        _;
    }

    modifier paidEnough(uint _price) { 
        require(msg.value >= _price); 
        _;
    }
    
    modifier checkValue(uint _id) {
        //refund after pay for goods
        _;
        uint _price = goodsList[_id].price;
        uint amountToRefund = msg.value - _price;
        goodsList[_id].buyer.transfer(amountToRefund);
    }

    // Constructor, can receive one or many variables here; only one allowed
    constructor() public {
        // msg provides details about the message that's sent to the contract
        // msg.sender is contract caller (address of contract creator)
        owner = msg.sender;
        goodsCount = 0;
    }

    function addGoods(string _name, uint _price, string _ipfspic) 
        public
        whenNotPaused
        returns (uint)
    {
        uint _id = goodsCount;
        goodsList[goodsCount] = GoodsLib.addGoods(_id, _name, _price, _ipfspic);
        goodsCount += 1;
        emit LogForSale(_id, goodsList[_id].price);
        return goodsCount;
    }

    // buy a goods
    function buyGoods(uint id) 
        public 
        payable
        paidEnough(goodsList[id].price)
        checkValue(id)
        whenNotPaused
    {
        goodsList[id].buyGoods();
        emit LogSold(id, goodsList[id].price, goodsList[id].buyer);
    }

    // ship a goods
    function shipGoods(uint id) 
        public
        verifyCaller(goodsList[id].seller)
        whenNotPaused
    {
        goodsList[id].shipGoods();
        emit LogShipped(id, goodsList[id].price, goodsList[id].seller);
    }

    // received a goods
    function receiveGoods(uint id)
        public
        verifyCaller(goodsList[id].buyer)
        whenNotPaused
    {
        goodsList[id].receiveGoods();
        emit LogReceived(id, goodsList[id].price, goodsList[id].buyer);
    }

    function fetchGoods(uint _id) 
        public 
        view
        whenNotPaused
        returns (uint id, string name, uint price, string ipfspic, uint state, address seller, address buyer) 
    {
        id = goodsList[_id].id; 
        name = goodsList[_id].name;
        price = goodsList[_id].price;
        ipfspic = goodsList[_id].ipfspic;
        state = uint(goodsList[_id].status);
        seller = goodsList[_id].seller;
        buyer = goodsList[_id].buyer;
        
        emit LogFetch(id, name, price, ipfspic, state, seller, buyer);
        return (id, name, price, ipfspic, state, seller, buyer);
    }

    function checkBalance() 
        public 
        view 
        onlyOwner
        whenNotPaused
        returns(uint) 
    {
        return address(this).balance;
    }

    function getAddress() 
        public 
        view
        onlyOwner
        whenNotPaused
        returns(address) 
    {
        return address(this);
    }
}