# 2018-Developer-Program-Final-Project

## TradeMyUsedStuff
The best online marketplace to buy and sell used stuff, you can uplist your used goods and buy goods which in the website.

### Flow Chart
![flowchart][flowchart]

## Environment Setup

### Steps
1. Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
1. Install [Ganache](https://truffleframework.com/ganache)
1. Install [Metamask](https://metamask.io/)
1. Install [Node.js v6+ LTS and npm](https://nodejs.org/en/)
1. Run the follwing command to Install [Truffle](https://truffleframework.com/docs/truffle/getting-started/installation)

    ```
    $ npm install -g truffle
    ```

## Deploy Solution

- Start Ganache
- Clone project to your compute under a empty folder
    ```
    git clone https://github.com/wangjia007bond/2018-Developer-Program-Final-Project.git
    ```
- Inside that folder, run
    ```
    truffle compile --network development
    truffle migrate --network development
    truffle test
    ```
- If everthing looks good, then start server to run frontend
    ```
    npm run start
    ```

[flowchart]: README-resources/marketplace.png