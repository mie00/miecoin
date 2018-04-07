var pr1 = `-----BEGIN EC PARAMETERS-----
BgkrJAMDAggBAQ4=
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MIHaAgEBBEBu2qqbqgkaDN97jlaCrdrzyZ1Yw3NFMarGgD+093UF8lm/Thwdl+pC
rMswpuqHvenhhze354perbyr4PIRIwhboAsGCSskAwMCCAEBDqGBhQOBggAEEZXN
F7z15pdIoftuSaOYGe5Qdp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEqu
IjFXjYfDUYCCQY3bTlHjNGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL
9M8I+4Sm7b66Nx0j4atyx/rT92VI5NbhpOFx5Iw=
-----END EC PRIVATE KEY-----`
var pu1 = `-----BEGIN PUBLIC KEY-----
MIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEEZXNF7z15pdIoftuSaOYGe5Q
dp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEquIjFXjYfDUYCCQY3bTlHj
NGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL9M8I+4Sm7b66Nx0j4aty
x/rT92VI5NbhpOFx5Iw=
-----END PUBLIC KEY-----`
var pr2 = `-----BEGIN EC PARAMETERS-----
BgkrJAMDAggBAQ4=
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MIHaAgEBBEANTutNALvX1B4KYoVvh31QwsgXtyyykBSdl56302vaoSC5fWXj9s44
D2pri994oK+jddaQU6GG3WUattV+s6N7oAsGCSskAwMCCAEBDqGBhQOBggAEkYhF
C5U8GMQZbsDyDMn4G6O8mOKj3pXn89U8BrA/48vR9Fc1VzLjnWVbVq+KKINoJjB3
/2GolLvQjuZCR/NMIEDH906+w3RTE1oHfN9sbmBLD431a06CBlI1EQwgfge32asO
X3JF+jnlAqsj1ZIslSPN/yxLP76iL1BU6lvMQ/A=
-----END EC PRIVATE KEY-----`
var pu2 = `-----BEGIN PUBLIC KEY-----
MIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEkYhFC5U8GMQZbsDyDMn4G6O8
mOKj3pXn89U8BrA/48vR9Fc1VzLjnWVbVq+KKINoJjB3/2GolLvQjuZCR/NMIEDH
906+w3RTE1oHfN9sbmBLD431a06CBlI1EQwgfge32asOX3JF+jnlAqsj1ZIslSPN
/yxLP76iL1BU6lvMQ/A=
-----END PUBLIC KEY-----`

module.exports.pr1 = pr1
module.exports.pu1 = pu1
module.exports.pr2 = pr2
module.exports.pu2 = pu2

module.exports.rawData = {
  'type': 'raw_data',
  'data': 'the data in the rowData object of the factory'
}

module.exports.otx = {
  'type': 'otx',
  'amount': 1001,
  'public_key': pu1,
  'created_at': 1522727362019
}

module.exports.otx2 = {
  'type': 'otx',
  'amount': 1002,
  'public_key': pu1,
  'created_at': 1522727362019
}

module.exports.itx = {
  'type': 'itx',
  'source': 'some source',
  'to_hash': 'this is the otx that it will go into',
  'signature': 'somesignature',
  'created_at': 1522727362019
}

module.exports.genesisBlock = {
  'height': 1,
  'hash': '9a6bf1f97185d9c3fe6db089fc8224c490d2f0287ce3af2409c3bdc0a3602d43',
  'parent_hash': '0000000000000000000000000000000000000000000000000000000000000000',
  'merkle_root': '321188842532c4c5ed5be1f4390bab7e0aa60cdfc6afa9cdcc66e35646018d02',
  'created_at': 1522727362019,
  'transactions': [
    {
      'block_transaction': true,
      'components': [
        {
          'type': 'raw_data',
          'data': '{"authors":["-----BEGIN PUBLIC KEY-----\nMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEEZXNF7z15pdIoftuSaOYGe5Q\ndp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEquIjFXjYfDUYCCQY3bTlHj\nNGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL9M8I+4Sm7b66Nx0j4aty\nx/rT92VI5NbhpOFx5Iw=\n-----END PUBLIC KEY-----","-----BEGIN PUBLIC KEY-----\nMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEkYhFC5U8GMQZbsDyDMn4G6O8\nmOKj3pXn89U8BrA/48vR9Fc1VzLjnWVbVq+KKINoJjB3/2GolLvQjuZCR/NMIEDH\n906+w3RTE1oHfN9sbmBLD431a06CBlI1EQwgfge32asOX3JF+jnlAqsj1ZIslSPN\n/yxLP76iL1BU6lvMQ/A=\n-----END PUBLIC KEY-----"]}',
          'created_at': 1522727362019
        }
      ]
    }
  ],
  'public_key': '',
  'private_key': ''
}
module.exports.firstBlockTransactionUTXO = {
  'type': 'otx',
  'amount': 100,
  'public_key': '-----BEGIN PUBLIC KEY-----\nMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEEZXNF7z15pdIoftuSaOYGe5Q\ndp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEquIjFXjYfDUYCCQY3bTlHj\nNGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL9M8I+4Sm7b66Nx0j4aty\nx/rT92VI5NbhpOFx5Iw=\n-----END PUBLIC KEY-----',
  'hash': '939c655e0e91ad0cef6890aa7ccb80af82d97ca069249ec4a06e0bb59d74d76c',
  'created_at': 1522727362019
}
module.exports.firstBlockTransaction = {
  'block_transaction': true,
  'components': [
    {
      'type': 'raw_data',
      'data': 'somedata',
      'created_at': 1522727362019
    }, module.exports.firstBlockTransactionUTXO
  ]
}
module.exports.firstBlock = {
  'height': 2,
  'hash': 'f95d911dc17d7e1466e4364c2ed47358fedfd78d005ba80691f0d09709239d00',
  'parent_hash': '9a6bf1f97185d9c3fe6db089fc8224c490d2f0287ce3af2409c3bdc0a3602d43',
  'merkle_root': '9a9ce82ba20af5876e062164ff6358f80bb6630d7aab2c8740cb61b604842096',
  'created_at': 1522872207435,
  'transactions': [
    module.exports.firstBlockTransaction
  ],
  'public_key': '-----BEGIN PUBLIC KEY-----\nMIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEEZXNF7z15pdIoftuSaOYGe5Q\ndp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEquIjFXjYfDUYCCQY3bTlHj\nNGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL9M8I+4Sm7b66Nx0j4aty\nx/rT92VI5NbhpOFx5Iw=\n-----END PUBLIC KEY-----',
  'signature': 'MIGEAkAy5xKN8iGIiQVKUc30IHzCc7EbCUk35NKPEJr/L42RtIf3YMMSOaE4p6kb1BAFGatM9x21ZMld4jVlXUXhGhnvAkA5XSvLp90GGm9Nwg7XyQtfdQZ+/v5RD3lS1vD7awcWZviKoUSh0jyuDbIg23L0HoV6s8kENzVEaUIcRbiNsooz'
}

module.exports.unknownComponent = {
  'type': 'somthing',
  'source': 'some source',
  'to_hash': 'this is the otx that it will go into',
  'created_at': 1522727362019
}
module.exports.invalidToHashTransaction = {
  'block_ransaction': false,
  'components': [module.exports.otx, module.exports.itx]
}
module.exports.invalidToHashTransaction2 = {
  'block_transaction': false,
  'components': [module.exports.otx2, module.exports.itx]
}
module.exports.sources = [
  {
    'itx': {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': 'somesignature',
      'created_at': 1522727362019
    },
    'source': {
      'amount': 1002,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  },
  {
    'itx': {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': 'somesignature',
      'created_at': 1522727362019
    },
    'source': {
      'amount': 1002,
      'public_key': pu1,
      'hash': 'some source123',
      'created_at': 1522727362019
    }
  }
]
module.exports.unmatchingSources = [
  {
    'itx': {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': 'somesignature',
      'created_at': 1522727362019
    },
    'source': {
      'amount': 1002,
      'public_key': pu1,
      'hash': 'some source2',
      'created_at': 1522727362019
    }
  },
  {
    'itx': {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': 'somesignature',
      'created_at': 1522727362019
    },
    'source': {
      'amount': 1002,
      'public_key': pu1,
      'hash': 'some source123',
      'created_at': 1522727362019
    }
  }
]
module.exports.otxItxSources = {
  'change': 1002 + 700 - 500 - 400 - 100,
  'otx': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 400,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 100,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  ],
  'itxSources': [
    {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'otx': {
        'type': 'otx',
        'amount': 700,
        'public_key': pu1,
        'hash': 'some source',
      'created_at': 1522727362019
      }
    },
    {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'otx': {
        'type': 'otx',
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123',
        'created_at': 1522727362019
      }
    }
  ]
}
module.exports.otxItxSourcesNoEnough = {
  'otx': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 400,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 803,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  ],
  'itxSources': [
    {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'created_at': 1522727362019,
      'signature': '',
      'otx': {
        'type': 'otx',
        'amount': 700,
        'public_key': pu1,
        'hash': 'some source',
        'created_at': 1522727362019
      }
    },
    {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'created_at': 1522727362019,
      'otx': {
        'type': 'otx',
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123',
        'created_at': 1522727362019
      }
    }
  ]
}
module.exports.otxItxSourcesBarelyEnough = {
  'otx': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 400,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 802,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  ],
  'itxSources': [
    {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'created_at': 1522727362019,
      'otx': {
        'type': 'otx',
        'amount': 700,
        'public_key': pu1,
        'hash': 'some source',
        'created_at': 1522727362019
      }
    },
    {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'created_at': 1522727362019,
      'otx': {
        'type': 'otx',
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123',
        'created_at': 1522727362019
      }
    }
  ]
}

module.exports.transaction = {
  'block_transaction': false,
  '_change': 1002 + 700 - 500 - 400 - 100,
  'components': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'created_at': 1522727362019,
      'otx': {
        'type': 'otx',
        'amount': 700,
        'public_key': pu1,
        'hash': 'some source',
        'created_at': 1522727362019
      }
    },
    {
      'type': 'otx',
      'amount': 400,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'itx',
      'source': 'some source123',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'created_at': 1522727362019,
      'otx': {
        'type': 'otx',
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123',
        'created_at': 1522727362019
      }
    },
    {
      'type': 'otx',
      'amount': 100,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  ]
}
module.exports.blockTransaction = {
  'block_transaction': true,
  '_change': -600,
  'components': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    },
    {
      'type': 'otx',
      'amount': 100,
      'public_key': pu1,
      'hash': 'some source',
      'created_at': 1522727362019
    }
  ]
}
module.exports.blocks = [{
  'height': 1,
  'parent_hash': 'hash0',
  'hash': 'hash1',
  'public_key': pu1,
  'signature': 'invalid signature',
  'merkle_root': 'someroot',
  'transactions': [],
  'created_at': 1521876048,
  'received_at': 1521876048
}, {
  'height': 2,
  'parent_hash': 'hash1',
  'hash': 'hash2',
  'public_key': pu1,
  'signature': 'invalid signature',
  'merkle_root': 'someroot',
  'transactions': [module.exports.transaction, module.exports.block_transaction],
  'created_at': 1521877048,
  'received_at': 1521877048
}]
module.exports.authors = [module.exports.pu1, module.exports.pu2]
