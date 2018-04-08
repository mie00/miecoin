CREATE TABLE IF NOT EXISTS block (
    height INT NOT NULL UNIQUE,
    parent_hash VARCHAR(255),
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    public_key VARCHAR(1024) NOT NULL,
    signature VARCHAR(1024) NOT NULL,
    merkle_root VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    received_at BIGINT NOT NULL,
    CONSTRAINT block_parent_hash_refernece FOREIGN KEY (parent_hash)
        REFERENCES block (hash) ON DELETE SET NULL -- see https://dev.mysql.com/doc/refman/5.5/en/innodb-foreign-key-constraints.html
);

CREATE TABLE IF NOT EXISTS tx (
    block_hash VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    block_transaction BOOLEAN,
    CONSTRAINT tx_block_hash_refernece FOREIGN KEY (block_hash)
        REFERENCES block (hash) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS otx (
    tx_hash VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    amount Int NOT NULL,
    public_key VARCHAR(1024) NOT NULL,
    created_at BIGINT NOT NULL,
    CONSTRAINT otx_tx_hash_refernece FOREIGN KEY (tx_hash)
        REFERENCES tx (hash) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS itx (
    tx_hash VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    signature VARCHAR(1024) NOT NULL,
    created_at BIGINT NOT NULL,
    CONSTRAINT itx_tx_hash_refernece FOREIGN KEY (tx_hash)
        REFERENCES tx (hash) ON DELETE CASCADE,
    CONSTRAINT itx_source_refernece FOREIGN KEY (source)
        REFERENCES otx (hash) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS raw_data (
    tx_hash VARCHAR(255) NOT NULL,
    hash VARCHAR(255) NOT NULL PRIMARY KEY,
    data VARCHAR(1024) NOT NULL,
    created_at BIGINT NOT NULL,
    CONSTRAINT raw_data_tx_hash_refernece FOREIGN KEY (tx_hash)
        REFERENCES tx (hash) ON DELETE CASCADE
);