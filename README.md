# MIECoin

A PoA toy cryptocurrency, that uses UTXO transaction format.

## Requirements

1. node.js v>=8.8.0, npm
2. MySql
3. openssl for key creation

## Installation

1. `git clone https://www.github.com/mie00/miecoin`
2. `cd miecoin`
3. `npm install`
4. create your ecdsa keys, you can use ./scripts/genkeys.sh for key generation.
5. Set your keys either by using `WALLET_PRIVATE_KEY`, `WALLET_PUBLIC_KEY` environment variables. or by changing the `wallet` attribute in ./config/default.json
6. configure the database in the config file or by setting the corresponding environment variables.
7. `CREATE DATABASE miecoin`
8. run ./scripts/migration.sql to create the required tables.
9. `node src/index.js`

## LICENSE

MIT