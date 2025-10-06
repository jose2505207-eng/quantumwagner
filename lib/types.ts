/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prediction_market.json`.
 */
export type PredictionMarket = {
  address: "9yKS9pupjKxLU8Ao5Y1BTN8i8x97XybNPEbsFhSn9QZw";
  metadata: {
    name: "predictionMarket";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "cancelMarket";
      discriminator: [205, 121, 84, 210, 222, 71, 150, 11];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "market";
          writable: true;
        }
      ];
      args: [];
    },
    {
      name: "initializeMarket";
      discriminator: [35, 35, 189, 193, 155, 48, 170, 203];
      accounts: [
        {
          name: "creator";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "market";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 114, 107, 101, 116];
              },
              {
                kind: "account";
                path: "config.next_market_id";
                account: "platformConfig";
              }
            ];
          };
        },
        {
          name: "mint";
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "market";
              },
              {
                kind: "const";
                value: [
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
                ];
              },
              {
                kind: "account";
                path: "mint";
              }
            ];
            program: {
              kind: "const";
              value: [
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
              ];
            };
          };
        },
        {
          name: "treasury";
          writable: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "question";
          type: "string";
        },
        {
          name: "category";
          type: {
            defined: {
              name: "marketCategory";
            };
          };
        },
        {
          name: "durationSeconds";
          type: "i64";
        },
        {
          name: "minBetAmount";
          type: "u64";
        },
        {
          name: "tags";
          type: {
            vec: "string";
          };
        },
        {
          name: "imageUrl";
          type: {
            option: "string";
          };
        }
      ];
    },
    {
      name: "initializePlatform";
      discriminator: [119, 201, 101, 45, 75, 122, 89, 3];
      accounts: [
        {
          name: "config";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "admin";
          writable: true;
          signer: true;
        },
        {
          name: "treasury";
        },
        {
          name: "emergencyAdmin";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "platformFeeBps";
          type: "u16";
        },
        {
          name: "minBetAmount";
          type: "u64";
        },
        {
          name: "maxBetAmount";
          type: "u64";
        },
        {
          name: "marketCreationFee";
          type: "u64";
        },
        {
          name: "minMarketDuration";
          type: "i64";
        },
        {
          name: "maxMarketDuration";
          type: "i64";
        }
      ];
    },
    {
      name: "placeBet";
      discriminator: [222, 62, 67, 220, 63, 166, 126, 33];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "config";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              }
            ];
          };
        },
        {
          name: "market";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 97, 114, 107, 101, 116];
              },
              {
                kind: "account";
                path: "market.market_id";
                account: "market";
              }
            ];
          };
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "vault";
          writable: true;
        },
        {
          name: "userPosition";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 115, 105, 116, 105, 111, 110];
              },
              {
                kind: "account";
                path: "market";
              },
              {
                kind: "account";
                path: "user";
              }
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "outcome";
          type: "bool";
        },
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "settleMarket";
      discriminator: [193, 153, 95, 216, 166, 6, 144, 217];
      accounts: [
        {
          name: "admin";
          signer: true;
        },
        {
          name: "market";
          writable: true;
        }
      ];
      args: [
        {
          name: "winningOutcome";
          type: "bool";
        }
      ];
    },
    {
      name: "withdrawWinnings";
      discriminator: [75, 180, 148, 117, 81, 100, 169, 50];
      accounts: [
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "market";
          writable: true;
        },
        {
          name: "userPosition";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [112, 111, 115, 105, 116, 105, 111, 110];
              },
              {
                kind: "account";
                path: "market";
              },
              {
                kind: "account";
                path: "user";
              }
            ];
          };
        },
        {
          name: "vault";
          writable: true;
        },
        {
          name: "userTokenAccount";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "market";
      discriminator: [219, 190, 213, 55, 0, 227, 198, 154];
    },
    {
      name: "platformConfig";
      discriminator: [160, 78, 128, 0, 248, 83, 230, 160];
    },
    {
      name: "userPosition";
      discriminator: [251, 248, 209, 245, 83, 234, 17, 27];
    }
  ];
  events: [
    {
      name: "betPlaced";
      discriminator: [88, 88, 145, 226, 126, 206, 32, 0];
    },
    {
      name: "marketCancelled";
      discriminator: [139, 163, 33, 168, 19, 180, 81, 170];
    },
    {
      name: "marketCreated";
      discriminator: [88, 184, 130, 231, 226, 84, 6, 58];
    },
    {
      name: "marketResolved";
      discriminator: [89, 67, 230, 95, 143, 106, 199, 202];
    },
    {
      name: "platformInitialized";
      discriminator: [16, 222, 212, 5, 213, 140, 112, 162];
    },
    {
      name: "winningsWithdrawn";
      discriminator: [155, 86, 83, 234, 90, 38, 56, 139];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "unauthorizedAdmin";
      msg: "Unauthorized admin access";
    },
    {
      code: 6001;
      name: "marketAlreadySettled";
      msg: "Market has already been settled";
    },
    {
      code: 6002;
      name: "marketAlreadyCancelled";
      msg: "Market has been cancelled";
    },
    {
      code: 6003;
      name: "marketCancelled";
      msg: "Market is cancelled";
    },
    {
      code: 6004;
      name: "marketNotExpired";
      msg: "Market has not expired yet";
    },
    {
      code: 6005;
      name: "marketNotSettled";
      msg: "Market is not settled";
    },
    {
      code: 6006;
      name: "marketNotActive";
      msg: "Market is not active for betting";
    },
    {
      code: 6007;
      name: "invalidUserPosition";
      msg: "Invalid user position";
    },
    {
      code: 6008;
      name: "alreadyClaimed";
      msg: "Winnings already claimed";
    },
    {
      code: 6009;
      name: "noWinningBet";
      msg: "No winning bet found";
    },
    {
      code: 6010;
      name: "noWinningsToWithdraw";
      msg: "No winnings to withdraw";
    },
    {
      code: 6011;
      name: "betAmountTooLow";
      msg: "Bet amount is below minimum";
    },
    {
      code: 6012;
      name: "invalidQuestionHash";
      msg: "Invalid question hash";
    },
    {
      code: 6013;
      name: "questionTooLong";
      msg: "Question is too long";
    },
    {
      code: 6014;
      name: "invalidDuration";
      msg: "Invalid duration";
    },
    {
      code: 6015;
      name: "invalidMinBetAmount";
      msg: "Invalid minimum bet amount";
    },
    {
      code: 6016;
      name: "platformPaused";
      msg: "Platform is currently paused";
    },
    {
      code: 6017;
      name: "invalidTreasury";
      msg: "Invalid treasury account";
    },
    {
      code: 6018;
      name: "invalidFeePercentage";
      msg: "Invalid fee percentage (max 10%)";
    },
    {
      code: 6019;
      name: "invalidBetAmountRange";
      msg: "Invalid bet amount range";
    },
    {
      code: 6020;
      name: "invalidDurationRange";
      msg: "Invalid duration range";
    },
    {
      code: 6021;
      name: "invalidQuestionLength";
      msg: "Invalid question length (1-500 characters)";
    },
    {
      code: 6022;
      name: "tooManyTags";
      msg: "Too many tags (max 5)";
    },
    {
      code: 6023;
      name: "tagTooLong";
      msg: "Tag is too long (max 50 characters)";
    },
    {
      code: 6024;
      name: "imageUrlTooLong";
      msg: "Image URL is too long (max 200 characters)";
    },
    {
      code: 6025;
      name: "marketCreationFeeRequired";
      msg: "Market creation fee required";
    },
    {
      code: 6026;
      name: "betAmountTooHigh";
      msg: "Bet amount exceeds maximum allowed";
    },
    {
      code: 6027;
      name: "marketExpired";
      msg: "Market has expired";
    },
    {
      code: 6028;
      name: "arithmeticOverflow";
      msg: "Arithmetic overflow";
    },
    {
      code: 6029;
      name: "divisionByZero";
      msg: "Division by zero";
    },
    {
      code: 6030;
      name: "insufficientFunds";
      msg: "Insufficient funds for operation";
    },
    {
      code: 6031;
      name: "invalidOracleConfig";
      msg: "Invalid oracle configuration";
    },
    {
      code: 6032;
      name: "stalePrice";
      msg: "Stale price data from oracle";
    },
    {
      code: 6033;
      name: "oracleResolutionFailed";
      msg: "Oracle resolution failed";
    },
    {
      code: 6034;
      name: "marketDisputed";
      msg: "Market dispute period active";
    },
    {
      code: 6035;
      name: "invalidMarketCategory";
      msg: "Invalid market category";
    },
    {
      code: 6036;
      name: "invalidPositionType";
      msg: "Invalid position type";
    },
    {
      code: 6037;
      name: "cannotBetOnResolvedMarket";
      msg: "Cannot bet on resolved market";
    },
    {
      code: 6038;
      name: "cannotCancelActiveMarket";
      msg: "Cannot cancel active market with bets";
    },
    {
      code: 6039;
      name: "emergencyPauseActive";
      msg: "Emergency pause activated";
    }
  ];
  types: [
    {
      name: "betPlaced";
      type: {
        kind: "struct";
        fields: [
          {
            name: "market";
            type: "pubkey";
          },
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "outcome";
            type: "bool";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "totalPool";
            type: "u64";
          },
          {
            name: "userYesTotal";
            type: "u64";
          },
          {
            name: "userNoTotal";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "market";
      type: {
        kind: "struct";
        fields: [
          {
            name: "marketId";
            type: "u64";
          },
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "question";
            type: "string";
          },
          {
            name: "category";
            type: {
              defined: {
                name: "marketCategory";
              };
            };
          },
          {
            name: "marketType";
            type: {
              defined: {
                name: "marketType";
              };
            };
          },
          {
            name: "createdAt";
            type: "i64";
          },
          {
            name: "expiresAt";
            type: "i64";
          },
          {
            name: "resolutionTime";
            type: {
              option: "i64";
            };
          },
          {
            name: "status";
            type: {
              defined: {
                name: "marketStatus";
              };
            };
          },
          {
            name: "winningOutcome";
            type: {
              option: "bool";
            };
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "minBetAmount";
            type: "u64";
          },
          {
            name: "totalYesAmount";
            type: "u64";
          },
          {
            name: "totalNoAmount";
            type: "u64";
          },
          {
            name: "yesBettorsCount";
            type: "u32";
          },
          {
            name: "noBettorsCount";
            type: "u32";
          },
          {
            name: "feePercentage";
            type: "u16";
          },
          {
            name: "isSettled";
            type: "bool";
          },
          {
            name: "isCancelled";
            type: "bool";
          },
          {
            name: "tags";
            type: {
              vec: "string";
            };
          },
          {
            name: "imageUrl";
            type: {
              option: "string";
            };
          },
          {
            name: "featured";
            type: "bool";
          },
          {
            name: "oracleSource";
            type: {
              defined: {
                name: "oracleSource";
              };
            };
          },
          {
            name: "manualResolution";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "marketCancelled";
      type: {
        kind: "struct";
        fields: [
          {
            name: "market";
            type: "pubkey";
          },
          {
            name: "marketId";
            type: "u64";
          },
          {
            name: "reason";
            type: "string";
          }
        ];
      };
    },
    {
      name: "marketCategory";
      type: {
        kind: "enum";
        variants: [
          {
            name: "price";
          },
          {
            name: "events";
          },
          {
            name: "social";
          },
          {
            name: "other";
          }
        ];
      };
    },
    {
      name: "marketCreated";
      type: {
        kind: "struct";
        fields: [
          {
            name: "marketId";
            type: "u64";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "question";
            type: "string";
          },
          {
            name: "category";
            type: {
              defined: {
                name: "marketCategory";
              };
            };
          },
          {
            name: "expiresAt";
            type: "i64";
          },
          {
            name: "minBetAmount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "marketResolved";
      type: {
        kind: "struct";
        fields: [
          {
            name: "market";
            type: "pubkey";
          },
          {
            name: "marketId";
            type: "u64";
          },
          {
            name: "winningOutcome";
            type: "bool";
          },
          {
            name: "totalVolume";
            type: "u64";
          },
          {
            name: "yesPool";
            type: "u64";
          },
          {
            name: "noPool";
            type: "u64";
          },
          {
            name: "resolutionTime";
            type: "i64";
          }
        ];
      };
    },
    {
      name: "marketStatus";
      type: {
        kind: "enum";
        variants: [
          {
            name: "active";
          },
          {
            name: "resolved";
          },
          {
            name: "disputed";
          },
          {
            name: "cancelled";
          }
        ];
      };
    },
    {
      name: "marketType";
      type: {
        kind: "enum";
        variants: [
          {
            name: "binary";
          }
        ];
      };
    },
    {
      name: "oracleSource";
      type: {
        kind: "enum";
        variants: [
          {
            name: "manual";
          },
          {
            name: "pyth";
          },
          {
            name: "chainLink";
          }
        ];
      };
    },
    {
      name: "platformConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "emergencyAdmin";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "platformFeeBps";
            type: "u16";
          },
          {
            name: "minBetAmount";
            type: "u64";
          },
          {
            name: "maxBetAmount";
            type: "u64";
          },
          {
            name: "marketCreationFee";
            type: "u64";
          },
          {
            name: "minMarketDuration";
            type: "i64";
          },
          {
            name: "maxMarketDuration";
            type: "i64";
          },
          {
            name: "emergencyPause";
            type: "bool";
          },
          {
            name: "treasury";
            type: "pubkey";
          },
          {
            name: "totalMarkets";
            type: "u64";
          },
          {
            name: "totalVolume";
            type: "u64";
          },
          {
            name: "totalFeesCollected";
            type: "u64";
          },
          {
            name: "nextMarketId";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "platformInitialized";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "pubkey";
          },
          {
            name: "treasury";
            type: "pubkey";
          },
          {
            name: "platformFeeBps";
            type: "u16";
          }
        ];
      };
    },
    {
      name: "userPosition";
      type: {
        kind: "struct";
        fields: [
          {
            name: "market";
            type: "pubkey";
          },
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "yesAmount";
            type: "u64";
          },
          {
            name: "noAmount";
            type: "u64";
          },
          {
            name: "hasClaimed";
            type: "bool";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "winningsWithdrawn";
      type: {
        kind: "struct";
        fields: [
          {
            name: "market";
            type: "pubkey";
          },
          {
            name: "user";
            type: "pubkey";
          },
          {
            name: "payoutAmount";
            type: "u64";
          },
          {
            name: "feesPaid";
            type: "u64";
          }
        ];
      };
    }
  ];
};
