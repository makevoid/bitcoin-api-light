"use strict"

// simple spec, will be changed to a real spec soon, sorry for the oversimplification
//
// run this file with node:
//
//    node spec/simple.js 

const client = require("../dist/bitcoin-api-light")

let address = `12h4ixAdASfwTTcN6t25chpYom8PxByrad`

client.enableLogging()

client.getBalance(address)
  .then((balance) => {
    console.log("Balance: ", balance)
  })


var addressUTXOs = "12ZA9QSu4GkADVQ2xvDWfT72rJq6ujKBHT"

client.getUTXOs(addressUTXOs)
  .then((utxos) => {
    console.log("UTXOs: ", utxos)
  })


let txHash = "010000000156ba94a4dd6c7d211c2d06939c3de5d075c2b4dfe4b1cb579730a498f2eb9a9d000000006a47304402201755b7adde097692c4113790768c608fb0d977ca8b20599437548b690c2f42de0220453f1d2750b8b9329768b15f16be12cf1d05a1652dea7cdd2fb94428e4e9c35b01210335a1a6be8cfff26d59ba3c15b5bc09cecf456c25616311c41828d9818c3021e5ffffffff02e8030000000000001976a914f36e80fa8a3f3b2b6b2bf3f4daa428099206157888ac0875724e180900001976a914f36e80fa8a3f3b2b6b2bf3f4daa428099206157888ac00000000"

client.pushTX(txHash)
  .then((resp) => {
    console.log(".... ", resp)
  })
