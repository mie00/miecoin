CREATE TABLE IF NOT EXISTS block (
    height INT NOT NULL,
    parent_hash VARCHAR(255) REFERENCES block.hash,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    public_key VARCHAR(1024) NOT NULL,
    signature VARCHAR(1024) NOT NULL,
    merkle_root VARCHAR(255) NOT NULL,
    created_at INT NOT NULL,
    received_at INT NOT NULL
);

CREATE TABLE IF NOT EXISTS tx (
    block_hash VARCHAR(255) NOT NULL REFERENCES block.hash,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    block_transaction BOOLEAN
);

CREATE TABLE IF NOT EXISTS itx (
    tx_hash VARCHAR(255) NOT NULL REFERENCES tx.hash,
    hash VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL REFERENCES txo.hash,
    sign VARCHAR(1024) NOT NULL
);

CREATE TABLE IF NOT EXISTS txo (
    tx_hash VARCHAR(255) NOT NULL REFERENCES tx.hash,
    hash VARCHAR(255) NOT NULL,
    amount Int NOT NULL,
    public_key VARCHAR(1024) NOT NULL
);

CREATE TABLE IF NOT EXISTS raw_data (
    tx_hash VARCHAR(255) REFERENCES tx.hash,
    hash VARCHAR(255) NOT NULL,
    data VARCHAR(1024) NOT NULL
);