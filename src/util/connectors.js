import { Connect, SimpleSigner } from 'uport-connect'

export let uport = new Connect('2018-Developer-Program-Final-Project', {
    clientId: '2orUzChRQCoH4iWcq8UESNBQRKBs8VJqHbK',
//    network: 'rinkeby or ropsten or kovan',
//    network: '127.0.0.1',
signer: SimpleSigner('c931d13158d1d6c32febc35225c2c52989b006ce73cbc902b5a046cd8a47de35')
})

export const web3 = uport.getWeb3()

