/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prediction_market.json`.
 */
export type PredictionMarket = {
  "address": "C8SAQXW3qhWTT1uGdpSegU466qTQAKQs3JB15TQ8toSc",
  "metadata": {
    "name": "predictionMarket",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyToken",
      "discriminator": [
        138,
        127,
        14,
        91,
        38,
        87,
        115,
        105
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token_launch.launch_id",
                "account": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "buyerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "royaltyVault",
          "writable": true
        },
        {
          "name": "battlePoolVault",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelMarket",
      "discriminator": [
        205,
        121,
        84,
        210,
        222,
        71,
        150,
        11
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "claimBattleReward",
      "discriminator": [
        16,
        249,
        95,
        48,
        190,
        83,
        80,
        143
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "battle",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "battle.battle_id",
                "account": "battle"
              }
            ]
          }
        },
        {
          "name": "battlePosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "battleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimCreatorTokens",
      "discriminator": [
        126,
        208,
        113,
        43,
        222,
        70,
        91,
        48
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token_launch.launch_id",
                "account": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createBattle",
      "discriminator": [
        2,
        249,
        54,
        216,
        42,
        99,
        187,
        102
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "battle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "config.next_battle_id",
                "account": "platformConfig"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "sideATokens",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "sideBTokens",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "sideAName",
          "type": "string"
        },
        {
          "name": "sideBName",
          "type": "string"
        },
        {
          "name": "startTime",
          "type": "i64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "winningMetric",
          "type": {
            "defined": {
              "name": "battleMetric"
            }
          }
        },
        {
          "name": "metaMarketEnabled",
          "type": "bool"
        },
        {
          "name": "imageUrl",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "createTokenLaunch",
      "discriminator": [
        93,
        87,
        58,
        126,
        88,
        75,
        172,
        233
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "config.next_launch_id",
                "account": "platformConfig"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "imageUri",
          "type": "string"
        },
        {
          "name": "socialLinks",
          "type": {
            "defined": {
              "name": "socialLinks"
            }
          }
        },
        {
          "name": "initialPrice",
          "type": "u64"
        },
        {
          "name": "totalSupply",
          "type": "u64"
        },
        {
          "name": "bondingCurveType",
          "type": {
            "defined": {
              "name": "curveType"
            }
          }
        },
        {
          "name": "tags",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "enterBattle",
      "discriminator": [
        86,
        34,
        180,
        134,
        230,
        17,
        220,
        121
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "battle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "battle.battle_id",
                "account": "battle"
              }
            ]
          }
        },
        {
          "name": "battlePosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "battleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "battleSide"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "increaseBattlePosition",
      "discriminator": [
        173,
        233,
        123,
        204,
        189,
        92,
        195,
        83
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "battle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "battle.battle_id",
                "account": "battle"
              }
            ]
          }
        },
        {
          "name": "battlePosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "battleVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "battle"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "additionalAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeLaunchpad",
      "discriminator": [
        220,
        172,
        45,
        121,
        79,
        84,
        246,
        3
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "emergencyAdmin"
        },
        {
          "name": "treasury"
        },
        {
          "name": "battlePoolVault"
        },
        {
          "name": "royaltyVault"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        },
        {
          "name": "tokenTradingFeeBps",
          "type": "u16"
        },
        {
          "name": "battleFeeBps",
          "type": "u16"
        },
        {
          "name": "creatorRoyaltyBps",
          "type": "u16"
        },
        {
          "name": "battleContributionBps",
          "type": "u16"
        },
        {
          "name": "minTokenCreationFee",
          "type": "u64"
        },
        {
          "name": "minTokenSupply",
          "type": "u64"
        },
        {
          "name": "maxTokenSupply",
          "type": "u64"
        },
        {
          "name": "minInitialPrice",
          "type": "u64"
        },
        {
          "name": "creatorAllocationBps",
          "type": "u16"
        },
        {
          "name": "minLockDuration",
          "type": "i64"
        },
        {
          "name": "defaultCurveType",
          "type": {
            "defined": {
              "name": "curveType"
            }
          }
        },
        {
          "name": "curveSteepness",
          "type": "u64"
        },
        {
          "name": "migrationThreshold",
          "type": "u64"
        },
        {
          "name": "dexMigrationFee",
          "type": "u64"
        },
        {
          "name": "minLiquidityPercentage",
          "type": "u16"
        },
        {
          "name": "battleEligibilityThreshold",
          "type": "u64"
        },
        {
          "name": "minBattleDuration",
          "type": "i64"
        },
        {
          "name": "maxBattleDuration",
          "type": "i64"
        },
        {
          "name": "minBattlePool",
          "type": "u64"
        },
        {
          "name": "maxTokensPerBattleSide",
          "type": "u8"
        },
        {
          "name": "marketCreationFee",
          "type": "u64"
        },
        {
          "name": "minMarketDuration",
          "type": "i64"
        },
        {
          "name": "maxMarketDuration",
          "type": "i64"
        },
        {
          "name": "marketCreationReputation",
          "type": "u64"
        },
        {
          "name": "battleCreationReputation",
          "type": "u64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "maxBetAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "config.next_market_id",
                "account": "platformConfig"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questionId",
          "type": "string"
        },
        {
          "name": "category",
          "type": {
            "defined": {
              "name": "marketCategory"
            }
          }
        },
        {
          "name": "durationSeconds",
          "type": "i64"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "tags",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "imageUrl",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury"
        },
        {
          "name": "emergencyAdmin"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        },
        {
          "name": "minBetAmount",
          "type": "u64"
        },
        {
          "name": "maxBetAmount",
          "type": "u64"
        },
        {
          "name": "marketCreationFee",
          "type": "u64"
        },
        {
          "name": "minMarketDuration",
          "type": "i64"
        },
        {
          "name": "maxMarketDuration",
          "type": "i64"
        }
      ]
    },
    {
      "name": "migrateToDex",
      "discriminator": [
        246,
        150,
        122,
        141,
        49,
        26,
        211,
        26
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token_launch.launch_id",
                "account": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "tokenMint",
          "writable": true
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "raydiumProgram"
        },
        {
          "name": "poolAccount",
          "writable": true
        },
        {
          "name": "poolTokenMint",
          "writable": true
        },
        {
          "name": "poolSolAccount",
          "writable": true
        },
        {
          "name": "poolTokenAccount",
          "writable": true
        },
        {
          "name": "creatorLpAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market.market_id",
                "account": "market"
              }
            ]
          }
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveBattle",
      "discriminator": [
        112,
        191,
        142,
        62,
        126,
        119,
        170,
        54
      ],
      "accounts": [
        {
          "name": "resolver",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "battle",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "battle.battle_id",
                "account": "battle"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": {
            "defined": {
              "name": "battleSide"
            }
          }
        }
      ]
    },
    {
      "name": "sellToken",
      "discriminator": [
        109,
        61,
        40,
        187,
        230,
        176,
        135,
        174
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token_launch.launch_id",
                "account": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "solVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "royaltyVault",
          "writable": true
        },
        {
          "name": "battlePoolVault",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tokenAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "settleMarket",
      "discriminator": [
        193,
        153,
        95,
        216,
        166,
        6,
        144,
        217
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "winningOutcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "withdrawCreatorRoyalties",
      "discriminator": [
        57,
        177,
        102,
        112,
        81,
        31,
        244,
        179
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "tokenLaunch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  108,
                  97,
                  117,
                  110,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token_launch.launch_id",
                "account": "tokenLaunch"
              }
            ]
          }
        },
        {
          "name": "royaltyVault",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "withdrawWinnings",
      "discriminator": [
        75,
        180,
        148,
        117,
        81,
        100,
        169,
        50
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "battle",
      "discriminator": [
        81,
        148,
        121,
        71,
        63,
        166,
        116,
        24
      ]
    },
    {
      "name": "battlePosition",
      "discriminator": [
        161,
        233,
        239,
        234,
        160,
        39,
        179,
        32
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "platformConfig",
      "discriminator": [
        160,
        78,
        128,
        0,
        248,
        83,
        230,
        160
      ]
    },
    {
      "name": "tokenLaunch",
      "discriminator": [
        92,
        242,
        228,
        230,
        214,
        216,
        8,
        148
      ]
    },
    {
      "name": "userPosition",
      "discriminator": [
        251,
        248,
        209,
        245,
        83,
        234,
        17,
        27
      ]
    }
  ],
  "events": [
    {
      "name": "battleCreated",
      "discriminator": [
        33,
        66,
        118,
        96,
        130,
        0,
        113,
        218
      ]
    },
    {
      "name": "battlePositionEntered",
      "discriminator": [
        52,
        208,
        148,
        216,
        120,
        129,
        29,
        203
      ]
    },
    {
      "name": "battlePositionIncreased",
      "discriminator": [
        150,
        40,
        74,
        73,
        63,
        103,
        163,
        173
      ]
    },
    {
      "name": "battleResolved",
      "discriminator": [
        47,
        156,
        226,
        94,
        163,
        176,
        162,
        241
      ]
    },
    {
      "name": "battleRewardClaimed",
      "discriminator": [
        8,
        167,
        243,
        101,
        154,
        92,
        164,
        201
      ]
    },
    {
      "name": "betPlaced",
      "discriminator": [
        88,
        88,
        145,
        226,
        126,
        206,
        32,
        0
      ]
    },
    {
      "name": "creatorRoyaltiesWithdrawn",
      "discriminator": [
        153,
        207,
        238,
        188,
        136,
        11,
        174,
        166
      ]
    },
    {
      "name": "creatorTokensClaimed",
      "discriminator": [
        170,
        220,
        148,
        128,
        126,
        198,
        180,
        231
      ]
    },
    {
      "name": "launchpadInitialized",
      "discriminator": [
        53,
        108,
        116,
        169,
        67,
        140,
        109,
        98
      ]
    },
    {
      "name": "marketCancelled",
      "discriminator": [
        139,
        163,
        33,
        168,
        19,
        180,
        81,
        170
      ]
    },
    {
      "name": "marketCreated",
      "discriminator": [
        88,
        184,
        130,
        231,
        226,
        84,
        6,
        58
      ]
    },
    {
      "name": "marketResolved",
      "discriminator": [
        89,
        67,
        230,
        95,
        143,
        106,
        199,
        202
      ]
    },
    {
      "name": "platformInitialized",
      "discriminator": [
        16,
        222,
        212,
        5,
        213,
        140,
        112,
        162
      ]
    },
    {
      "name": "tokenLaunchCreated",
      "discriminator": [
        200,
        177,
        217,
        82,
        127,
        93,
        98,
        216
      ]
    },
    {
      "name": "tokenMigrated",
      "discriminator": [
        109,
        61,
        145,
        107,
        50,
        158,
        28,
        154
      ]
    },
    {
      "name": "tokenPurchased",
      "discriminator": [
        3,
        73,
        186,
        50,
        15,
        181,
        213,
        37
      ]
    },
    {
      "name": "tokenSold",
      "discriminator": [
        88,
        61,
        1,
        247,
        185,
        6,
        252,
        86
      ]
    },
    {
      "name": "winningsWithdrawn",
      "discriminator": [
        155,
        86,
        83,
        234,
        90,
        38,
        56,
        139
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "platformPaused",
      "msg": "Platform is currently paused"
    },
    {
      "code": 6001,
      "name": "unauthorizedAdmin",
      "msg": "Unauthorized admin access"
    },
    {
      "code": 6002,
      "name": "tokenCreationDisabled",
      "msg": "Token creation is currently disabled"
    },
    {
      "code": 6003,
      "name": "battleCreationDisabled",
      "msg": "Battle creation is currently disabled"
    },
    {
      "code": 6004,
      "name": "invalidFeePercentage",
      "msg": "Invalid Fee Percentage"
    },
    {
      "code": 6005,
      "name": "tokenSupplyTooLow",
      "msg": "Token supply is below minimum"
    },
    {
      "code": 6006,
      "name": "initialPriceTooLow",
      "msg": "Initial price is too low"
    },
    {
      "code": 6007,
      "name": "invalidDuration",
      "msg": "Invalid duration"
    },
    {
      "code": 6008,
      "name": "invalidBetAmountRange",
      "msg": "Invalid bet amount range"
    },
    {
      "code": 6009,
      "name": "invalidThreshold",
      "msg": "Invalid threshold configuration"
    },
    {
      "code": 6010,
      "name": "invalidBattleConfig",
      "msg": "Invalid battle configuration"
    },
    {
      "code": 6011,
      "name": "invalidTreasury",
      "msg": "Treasury account is invalid"
    },
    {
      "code": 6012,
      "name": "invalidNameLength",
      "msg": "Invalid name length"
    },
    {
      "code": 6013,
      "name": "invalidSymbolLength",
      "msg": "Invalid symbol length"
    },
    {
      "code": 6014,
      "name": "invalidDescriptionLength",
      "msg": "Invalid description length"
    },
    {
      "code": 6015,
      "name": "invalidImageUriLength",
      "msg": "Invalid image URI length"
    },
    {
      "code": 6016,
      "name": "tooManyTags",
      "msg": "Too many tags"
    },
    {
      "code": 6017,
      "name": "tagTooLong",
      "msg": "Tag is too long"
    },
    {
      "code": 6018,
      "name": "launchNotActive",
      "msg": "Launchpad is not active"
    },
    {
      "code": 6019,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6020,
      "name": "tradingPaused",
      "msg": "Trading is currently paused"
    },
    {
      "code": 6021,
      "name": "alreadyMigrated",
      "msg": "Token launch has already been migrated"
    },
    {
      "code": 6022,
      "name": "invalidAmount",
      "msg": "Invalid token amount"
    },
    {
      "code": 6023,
      "name": "insufficientTokens",
      "msg": "Insufficient tokens available for purchase"
    },
    {
      "code": 6024,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6025,
      "name": "insufficientSol",
      "msg": "Insufficient SOL for transaction"
    },
    {
      "code": 6026,
      "name": "unauthorizedCreator",
      "msg": "Unauthorized creator access"
    },
    {
      "code": 6027,
      "name": "belowMigrationThreshold",
      "msg": "Below migration threshold"
    },
    {
      "code": 6028,
      "name": "launchCancelled",
      "msg": "Launch has been cancelled"
    },
    {
      "code": 6029,
      "name": "noTokensToClaim",
      "msg": "No tokens available to claim"
    },
    {
      "code": 6030,
      "name": "noRoyaltiesToWithdraw",
      "msg": "No Royalties to withdraw"
    }
  ],
  "types": [
    {
      "name": "battle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "sideATokens",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "sideBTokens",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "sideAName",
            "type": "string"
          },
          {
            "name": "sideBName",
            "type": "string"
          },
          {
            "name": "sideAPool",
            "type": "u64"
          },
          {
            "name": "sideBPool",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "feeContributionRate",
            "type": "u16"
          },
          {
            "name": "accumulatedFromTokens",
            "type": "u64"
          },
          {
            "name": "sideAVolume",
            "type": "u64"
          },
          {
            "name": "sideBVolume",
            "type": "u64"
          },
          {
            "name": "sideAParticipants",
            "type": "u32"
          },
          {
            "name": "sideBParticipants",
            "type": "u32"
          },
          {
            "name": "uniqueParticipants",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "resolutionTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "battleStatus"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": {
                "defined": {
                  "name": "battleSide"
                }
              }
            }
          },
          {
            "name": "winningMetric",
            "type": {
              "defined": {
                "name": "battleMetric"
              }
            }
          },
          {
            "name": "metaMarketEnabled",
            "type": "bool"
          },
          {
            "name": "metaMarketId",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "imageUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "featured",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "battleCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "sideAName",
            "type": "string"
          },
          {
            "name": "sideBName",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleMetric",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "totalVolume"
          },
          {
            "name": "priceGain"
          },
          {
            "name": "holderGrowth"
          },
          {
            "name": "socialEngagement"
          }
        ]
      }
    },
    {
      "name": "battlePosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "battle",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "battleSide"
              }
            }
          },
          {
            "name": "entryAmount",
            "type": "u64"
          },
          {
            "name": "sharesOwned",
            "type": "u64"
          },
          {
            "name": "entryPrice",
            "type": "u64"
          },
          {
            "name": "specificTokens",
            "type": {
              "vec": {
                "defined": {
                  "name": "tokenStake"
                }
              }
            }
          },
          {
            "name": "settled",
            "type": "bool"
          },
          {
            "name": "payoutAmount",
            "type": "u64"
          },
          {
            "name": "profitLoss",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "lastIncreasedAt",
            "type": "i64"
          },
          {
            "name": "settledAt",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "battlePositionEntered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "battleSide"
              }
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "sidePool",
            "type": "u64"
          },
          {
            "name": "participantCount",
            "type": "u32"
          },
          {
            "name": "enteredAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battlePositionIncreased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "battleSide"
              }
            }
          },
          {
            "name": "additionalAmount",
            "type": "u64"
          },
          {
            "name": "newTotalAmount",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "sidePool",
            "type": "u64"
          },
          {
            "name": "increasedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "winner",
            "type": {
              "defined": {
                "name": "battleSide"
              }
            }
          },
          {
            "name": "winningPool",
            "type": "u64"
          },
          {
            "name": "losingPool",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "resolvedBy",
            "type": "pubkey"
          },
          {
            "name": "resolvedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleRewardClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "battleId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "battleSide"
              }
            }
          },
          {
            "name": "entryAmount",
            "type": "u64"
          },
          {
            "name": "payoutAmount",
            "type": "u64"
          },
          {
            "name": "profitLoss",
            "type": "i64"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleSide",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sideA"
          },
          {
            "name": "sideB"
          }
        ]
      }
    },
    {
      "name": "battleStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "upcoming"
          },
          {
            "name": "active"
          },
          {
            "name": "resolving"
          },
          {
            "name": "resolved"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "betPlaced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "outcome",
            "type": "bool"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "totalPool",
            "type": "u64"
          },
          {
            "name": "userYesTotal",
            "type": "u64"
          },
          {
            "name": "userNoTotal",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "creatorRoyaltiesWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "amountWithdrawn",
            "type": "u64"
          },
          {
            "name": "withdrawnAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "creatorTokensClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "amountClaimed",
            "type": "u64"
          },
          {
            "name": "totalClaimed",
            "type": "u64"
          },
          {
            "name": "totalAllocation",
            "type": "u64"
          },
          {
            "name": "currentMarketCap",
            "type": "u64"
          },
          {
            "name": "unlockPercentage",
            "type": "u16"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "curveType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "linear"
          },
          {
            "name": "exponential"
          },
          {
            "name": "logarithmic"
          }
        ]
      }
    },
    {
      "name": "launchStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "migrated"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "launchpadInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "tokenTradingFeeBps",
            "type": "u16"
          },
          {
            "name": "battleFeeBps",
            "type": "u16"
          },
          {
            "name": "migrationThreshold",
            "type": "u64"
          },
          {
            "name": "battleEligibilityThreshold",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "questionId",
            "type": "string"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "marketCategory"
              }
            }
          },
          {
            "name": "marketType",
            "type": {
              "defined": {
                "name": "marketType"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "resolutionTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "winningOutcome",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "totalYesAmount",
            "type": "u64"
          },
          {
            "name": "totalNoAmount",
            "type": "u64"
          },
          {
            "name": "yesBettorsCount",
            "type": "u32"
          },
          {
            "name": "noBettorsCount",
            "type": "u32"
          },
          {
            "name": "feePercentage",
            "type": "u16"
          },
          {
            "name": "isSettled",
            "type": "bool"
          },
          {
            "name": "isCancelled",
            "type": "bool"
          },
          {
            "name": "tags",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "imageUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "featured",
            "type": "bool"
          },
          {
            "name": "oracleSource",
            "type": {
              "defined": {
                "name": "oracleSource"
              }
            }
          },
          {
            "name": "manualResolution",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "marketCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "reason",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "marketCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "price"
          },
          {
            "name": "events"
          },
          {
            "name": "social"
          },
          {
            "name": "other"
          }
        ]
      }
    },
    {
      "name": "marketCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "questionId",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "marketCategory"
              }
            }
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "winningOutcome",
            "type": "bool"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "yesPool",
            "type": "u64"
          },
          {
            "name": "noPool",
            "type": "u64"
          },
          {
            "name": "resolutionTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "resolved"
          },
          {
            "name": "disputed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "marketType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "binary"
          }
        ]
      }
    },
    {
      "name": "oracleSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "manual"
          },
          {
            "name": "pyth"
          },
          {
            "name": "chainLink"
          }
        ]
      }
    },
    {
      "name": "platformConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "emergencyAdmin",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "tokenTradingFeeBps",
            "type": "u16"
          },
          {
            "name": "battleFeeBps",
            "type": "u16"
          },
          {
            "name": "creatorRoyaltyBps",
            "type": "u16"
          },
          {
            "name": "battleContributionBps",
            "type": "u16"
          },
          {
            "name": "minTokenCreationFee",
            "type": "u64"
          },
          {
            "name": "minTokenSupply",
            "type": "u64"
          },
          {
            "name": "maxTokenSupply",
            "type": "u64"
          },
          {
            "name": "minInitialPrice",
            "type": "u64"
          },
          {
            "name": "creatorAllocationBps",
            "type": "u16"
          },
          {
            "name": "minLockDuration",
            "type": "i64"
          },
          {
            "name": "defaultCurveType",
            "type": {
              "defined": {
                "name": "curveType"
              }
            }
          },
          {
            "name": "curveSteepness",
            "type": "u64"
          },
          {
            "name": "migrationThreshold",
            "type": "u64"
          },
          {
            "name": "dexMigrationFee",
            "type": "u64"
          },
          {
            "name": "minLiquidityPercentage",
            "type": "u16"
          },
          {
            "name": "battleEligibilityThreshold",
            "type": "u64"
          },
          {
            "name": "minBattleDuration",
            "type": "i64"
          },
          {
            "name": "maxBattleDuration",
            "type": "i64"
          },
          {
            "name": "minBattlePool",
            "type": "u64"
          },
          {
            "name": "maxTokensPerBattleSide",
            "type": "u8"
          },
          {
            "name": "marketCreationFee",
            "type": "u64"
          },
          {
            "name": "minMarketDuration",
            "type": "i64"
          },
          {
            "name": "maxMarketDuration",
            "type": "i64"
          },
          {
            "name": "marketCreationReputation",
            "type": "u64"
          },
          {
            "name": "battleCreationReputation",
            "type": "u64"
          },
          {
            "name": "minBetAmount",
            "type": "u64"
          },
          {
            "name": "maxBetAmount",
            "type": "u64"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "battlePoolVault",
            "type": "pubkey"
          },
          {
            "name": "royaltyVault",
            "type": "pubkey"
          },
          {
            "name": "emergencyPause",
            "type": "bool"
          },
          {
            "name": "tokenCreationEnabled",
            "type": "bool"
          },
          {
            "name": "battleCreationEnabled",
            "type": "bool"
          },
          {
            "name": "marketCreationEnabled",
            "type": "bool"
          },
          {
            "name": "nextLaunchId",
            "type": "u64"
          },
          {
            "name": "nextBattleId",
            "type": "u64"
          },
          {
            "name": "nextMarketId",
            "type": "u64"
          },
          {
            "name": "totalTokensCreated",
            "type": "u64"
          },
          {
            "name": "totalBattles",
            "type": "u64"
          },
          {
            "name": "totalMarkets",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "platformInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "socialLinks",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "twitter",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "telegram",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "website",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "discord",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "tokenLaunch",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "solVault",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "launchStatus"
              }
            }
          },
          {
            "name": "tradingPaused",
            "type": "bool"
          },
          {
            "name": "emergencyWithdrawalEnabled",
            "type": "bool"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "socialLinks",
            "type": {
              "defined": {
                "name": "socialLinks"
              }
            }
          },
          {
            "name": "initialPrice",
            "type": "u64"
          },
          {
            "name": "currentPrice",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          },
          {
            "name": "bondingCurveType",
            "type": {
              "defined": {
                "name": "curveType"
              }
            }
          },
          {
            "name": "migrationThreshold",
            "type": "u64"
          },
          {
            "name": "currentMarketCap",
            "type": "u64"
          },
          {
            "name": "migrated",
            "type": "bool"
          },
          {
            "name": "dexPool",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "battleEligible",
            "type": "bool"
          },
          {
            "name": "battleParticipationCount",
            "type": "u32"
          },
          {
            "name": "battleWins",
            "type": "u32"
          },
          {
            "name": "totalBattleVolume",
            "type": "u64"
          },
          {
            "name": "activeBattleId",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "battleVolumeSnapshot",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "tradingFeePercentage",
            "type": "u16"
          },
          {
            "name": "accumulatedFees",
            "type": "u64"
          },
          {
            "name": "battlePoolContribution",
            "type": "u64"
          },
          {
            "name": "creatorRoyalties",
            "type": "u64"
          },
          {
            "name": "totalBuyers",
            "type": "u32"
          },
          {
            "name": "totalTrades",
            "type": "u32"
          },
          {
            "name": "creatorAllocation",
            "type": "u64"
          },
          {
            "name": "creatorUnlocked",
            "type": "u64"
          },
          {
            "name": "creatorClaimed",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "launchStartTime",
            "type": "i64"
          },
          {
            "name": "migratedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "lastTradeAt",
            "type": "i64"
          },
          {
            "name": "tags",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "featured",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "tokenLaunchCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "initialPrice",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "bondingCurveType",
            "type": {
              "defined": {
                "name": "curveType"
              }
            }
          },
          {
            "name": "creatorAllocation",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenMigrated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "dexPool",
            "type": "pubkey"
          },
          {
            "name": "liquiditySol",
            "type": "u64"
          },
          {
            "name": "liquidityTokens",
            "type": "u64"
          },
          {
            "name": "migrationFee",
            "type": "u64"
          },
          {
            "name": "finalMarketCap",
            "type": "u64"
          },
          {
            "name": "migratedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenPurchased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "solCost",
            "type": "u64"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "totalCost",
            "type": "u64"
          },
          {
            "name": "newPrice",
            "type": "u64"
          },
          {
            "name": "newMarketCap",
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenSold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "launchId",
            "type": "u64"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "solReturn",
            "type": "u64"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "netSolReturn",
            "type": "u64"
          },
          {
            "name": "newPrice",
            "type": "u64"
          },
          {
            "name": "newMarketCap",
            "type": "u64"
          },
          {
            "name": "circulatingSupply",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenStake",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "yesAmount",
            "type": "u64"
          },
          {
            "name": "noAmount",
            "type": "u64"
          },
          {
            "name": "hasClaimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "winningsWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "payoutAmount",
            "type": "u64"
          },
          {
            "name": "feesPaid",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
