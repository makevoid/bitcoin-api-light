"use strict"

const axios = require('axios')
const c     = console

let LOG = false

const enableLogging = () => {
  LOG = true
}

const balanceUrl = (address, confirmations) => {
  return `https://blockchain.info/q/addressbalance/${address}?confirmations=${confirmations}&cors=true`
}

const unspentUrl = (address) => {
  return `https://blockchain.info/unspent?active=${address}&cors=true`
}

const pushTXUrl  = "https://api.blockcypher.com/v1/btc/main/txs/push"

const getBalance = (address, confirmations = 1) => {
  let url = balanceUrl(address, confirmations)
  // c.log(url)
  return axios.get(url)
    .then((resp) => {
      let balance = Number(resp.data)
      if (!balance) return Promise.reject()
      if (LOG)      c.log(`Balance of '${address}' at 0 confirmations:`, balance)
      return Promise.resolve(balance)
    })
    .catch((resp) => {
      if (resp === undefined) return Promise.resolve(0)

      let error = resp.data.error
      c.error(`Bitcoin-API-light - Error during getBalance, response from Blockchain.info API:`, error)
      return Promise.reject(error)
    })
}

const getUTXOs = (address) => {
  let url = unspentUrl(address)
  return axios.get(url)
    .then((resp) => {
      var utxos = []
      var outputs = resp.data.unspent_outputs
      outputs.forEach((output, idx) => {
        utxos.push({
          txId:          output.tx_hash_big_endian,
          vout:          idx,
          scriptPubKey:  output.script,
          satoshis:      output.value,
        })
      })
      if (LOG) c.log(`UTXOs for address '${address}':\n`, utxos)
      return Promise.resolve(utxos)
    })
    .catch((resp) => {
      if (resp.data === "No free outputs to spend") return Promise.resolve([])

      let error = resp.data.error
      c.error(`Bitcoin-API-light - Error during getUTXOs, response from Blockcypher API:`, error)
      return Promise.reject(error)
    })
}

const pushTX = (rawTX) => {
  let tx = { tx: rawTX }
  return axios.post(pushTXUrl, {
      data: tx,
    })
    .then((resp) => {
        var txHash = resp.data.tx.hash
        c.log(`Transaction sent!\nTx hash:`, txHash, `\nSee the transaction on Blockcypher's block explorer: https://live.blockcypher.com/btc/tx/${txHash}`)
        return Promise.resolve(txHash)
    })
    .catch((resp) => {
      let error = resp.data.error
      c.error("Bitcoin-API-light - Error during pushTX, response from Blockcypher API:", error)
      return Promise.reject(error)
    })
}


module.exports = {
  getBalance:     getBalance,
  getUTXOs:       getUTXOs,
  pushTX:         pushTX,
  enableLogging:  enableLogging,
}
