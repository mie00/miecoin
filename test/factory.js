var pr1 = `-----BEGIN EC PARAMETERS-----
BgkrJAMDAggBAQ4=
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MIHaAgEBBEBu2qqbqgkaDN97jlaCrdrzyZ1Yw3NFMarGgD+093UF8lm/Thwdl+pC
rMswpuqHvenhhze354perbyr4PIRIwhboAsGCSskAwMCCAEBDqGBhQOBggAEEZXN
F7z15pdIoftuSaOYGe5Qdp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEqu
IjFXjYfDUYCCQY3bTlHjNGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL
9M8I+4Sm7b66Nx0j4atyx/rT92VI5NbhpOFx5Iw=
-----END EC PRIVATE KEY-----
`
var pu1 = `-----BEGIN PUBLIC KEY-----
MIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEEZXNF7z15pdIoftuSaOYGe5Q
dp/xkEBYjQy1WF0EdI6CoURWDZ1/BmIqPK22Qh8arEquIjFXjYfDUYCCQY3bTlHj
NGJOYCwXRKs5HGBfzQdSHGz5TyrYZR7TRNIczvfOA6JL9M8I+4Sm7b66Nx0j4aty
x/rT92VI5NbhpOFx5Iw=
-----END PUBLIC KEY-----
`
var pr2 = `-----BEGIN EC PARAMETERS-----
BgkrJAMDAggBAQ4=
-----END EC PARAMETERS-----
-----BEGIN EC PRIVATE KEY-----
MIHaAgEBBEANTutNALvX1B4KYoVvh31QwsgXtyyykBSdl56302vaoSC5fWXj9s44
D2pri994oK+jddaQU6GG3WUattV+s6N7oAsGCSskAwMCCAEBDqGBhQOBggAEkYhF
C5U8GMQZbsDyDMn4G6O8mOKj3pXn89U8BrA/48vR9Fc1VzLjnWVbVq+KKINoJjB3
/2GolLvQjuZCR/NMIEDH906+w3RTE1oHfN9sbmBLD431a06CBlI1EQwgfge32asO
X3JF+jnlAqsj1ZIslSPN/yxLP76iL1BU6lvMQ/A=
-----END EC PRIVATE KEY-----
`
var pu2 = `-----BEGIN PUBLIC KEY-----
MIGbMBQGByqGSM49AgEGCSskAwMCCAEBDgOBggAEkYhFC5U8GMQZbsDyDMn4G6O8
mOKj3pXn89U8BrA/48vR9Fc1VzLjnWVbVq+KKINoJjB3/2GolLvQjuZCR/NMIEDH
906+w3RTE1oHfN9sbmBLD431a06CBlI1EQwgfge32asOX3JF+jnlAqsj1ZIslSPN
/yxLP76iL1BU6lvMQ/A=
-----END PUBLIC KEY-----
`

module.exports = {
  'pr1': pr1,
  'pu1': pu1,
  'pr2': pr2,
  'pu2': pu2,
  'rawData': {
    'type': 'raw_data',
    'data': 'the data in the rowData object of the factory'
  },
  'otx': {
    'type': 'otx',
    'amount': 1001,
    'public_key': pu1
  },
  'itx': {
    'type': 'itx',
    'source': 'some source',
    'to_hash': 'this is the otx that it will go into',
    'signature': 'somesignature'
  },
  'unknownComponent': {
    'type': 'somthing',
    'source': 'some source',
    'to_hash': 'this is the otx that it will go into'
  },
  'invalidToHashTransaction': {
    'block_ransaction': false,
    'components': [
      {
        'type': 'otx',
        'amount': 1001,
        'public_key': pu1
      }, {
        'type': 'itx',
        'source': 'some source',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      }

    ]
  },
  'invalidToHashTransaction2': {
    'block_transaction': false,
    'components': [
      {
        'type': 'otx',
        'amount': 1002,
        'public_key': pu1
      }, {
        'type': 'itx',
        'source': 'some source',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      }

    ]
  },
  'sources': [
    {
      'itx': {
        'type': 'itx',
        'source': 'some source',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      },
      'source': {
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source'
      }
    },
    {
      'itx': {
        'type': 'itx',
        'source': 'some source123',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      },
      'source': {
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123'
      }
    }
  ],
  'unmatchingSources': [
    {
      'itx': {
        'type': 'itx',
        'source': 'some source',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      },
      'source': {
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source2'
      }
    },
    {
      'itx': {
        'type': 'itx',
        'source': 'some source123',
        'to_hash': 'this is the otx that it will go into',
        'signature': 'somesignature'
      },
      'source': {
        'amount': 1002,
        'public_key': pu1,
        'hash': 'some source123'
      }
    }
  ],
  'otxItxSources': {
    'change': 1002 + 700 - 500 - 400 - 100,
    'otx': [
      {
        'type': 'otx',
        'amount': 500,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 400,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 100,
        'public_key': pu1,
        'hash': 'some source'
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
          'hash': 'some source'
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
          'hash': 'some source123'
        }
      }
    ]
  },
  'otxItxSourcesNoEnough': {
    'otx': [
      {
        'type': 'otx',
        'amount': 500,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 400,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 803,
        'public_key': pu1,
        'hash': 'some source'
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
          'hash': 'some source'
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
          'hash': 'some source123'
        }
      }
    ]
  },
  'otxItxSourcesBarelyEnough': {
    'otx': [
      {
        'type': 'otx',
        'amount': 500,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 400,
        'public_key': pu1,
        'hash': 'some source'
      },
      {
        'type': 'otx',
        'amount': 802,
        'public_key': pu1,
        'hash': 'some source'
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
          'hash': 'some source'
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
          'hash': 'some source123'
        }
      }
    ]
  }
}

module.exports.transaction = {
  'block_transaction': false,
  '_change': 1002 + 700 - 500 - 400 - 100,
  'components': [
    {
      'type': 'otx',
      'amount': 500,
      'public_key': pu1,
      'hash': 'some source'
    },
    {
      'type': 'itx',
      'source': 'some source',
      'to_hash': 'this is the otx that it will go into',
      'signature': '',
      'otx': {
        'type': 'otx',
        'amount': 700,
        'public_key': pu1,
        'hash': 'some source'
      }
    },
    {
      'type': 'otx',
      'amount': 400,
      'public_key': pu1,
      'hash': 'some source'
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
        'hash': 'some source123'
      }
    },
    {
      'type': 'otx',
      'amount': 100,
      'public_key': pu1,
      'hash': 'some source'
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
      'hash': 'some source'
    },
    {
      'type': 'otx',
      'amount': 100,
      'public_key': pu1,
      'hash': 'some source'
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
