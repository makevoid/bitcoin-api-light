"use strict";

var axios = require('axios');
var c = console;

var LOG = false;

var enableLogging = function enableLogging() {
  LOG = true;
};

var balanceUrl = function balanceUrl(address, confirmations) {
  return "https://blockchain.info/q/addressbalance/" + address + "?confirmations=" + confirmations + "&cors=true";
};

var unspentUrl = function unspentUrl(address) {
  return "https://blockchain.info/unspent?active=" + address + "&cors=true";
};

var pushTXUrl = "https://api.blockcypher.com/v1/btc/main/txs/push";

var getBalance = function getBalance(address) {
  var confirmations = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var url = balanceUrl(address, confirmations);
  // c.log(url)
  return axios.get(url).then(function (resp) {
    var balance = Number(resp.data);
    if (!balance) return Promise.reject();
    if (LOG) c.log("Balance of '" + address + "' at 0 confirmations:", balance);
    return Promise.resolve(balance);
  }).catch(function (resp) {
    if (resp === undefined) return Promise.resolve(0);

    var error = resp.data.error;
    c.error("Bitcoin-API-light - Error during getBalance, response from Blockchain.info API:", error);
    return Promise.reject(error);
  });
};

var getUTXOs = function getUTXOs(address) {
  var url = unspentUrl(address);
  return axios.get(url).then(function (resp) {
    var utxos = [];
    var outputs = resp.data.unspent_outputs;
    outputs.forEach(function (output) {
      utxos.push({
        txId: output.tx_hash_big_endian,
        vout: output.tx_output_n,
        scriptPubKey: output.script,
        satoshis: output.value,
        address: address
      });
    });
    if (LOG) c.log("UTXOs for address '" + address + "':\n", utxos);
    return Promise.resolve(utxos);
  }).catch(function (resp) {
    if (resp.data === "No free outputs to spend") return Promise.resolve([]);

    var error = resp.data.error;
    c.error("Bitcoin-API-light - Error during getUTXOs, response from Blockcypher API:", error);
    return Promise.reject(error);
  });
};

var pushTX = function pushTX(rawTX) {
  var tx = { tx: rawTX };
  return axios.post(pushTXUrl, tx).then(function (resp) {
    var txHash = resp.data.tx.hash;
    c.log("Transaction sent!\nTx hash:", txHash, "\nSee the transaction on Blockcypher's block explorer: https://live.blockcypher.com/btc/tx/" + txHash);
    return Promise.resolve(txHash);
  }).catch(function (resp) {
    var error = resp.data.error;
    c.error("Bitcoin-API-light - Error during pushTX, response from Blockcypher API:", error);
    return Promise.reject(error);
  });
};

module.exports = {
  getBalance: getBalance,
  getUTXOs: getUTXOs,
  pushTX: pushTX,
  enableLogging: enableLogging
};