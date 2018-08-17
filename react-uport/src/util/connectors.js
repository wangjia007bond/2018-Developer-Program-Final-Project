import { Connect, SimpleSigner } from 'uport-connect'

export let uport = new Connect('2018-Developer-Program-Final-Project', {
  })

export const web3 = uport.getWeb3()
