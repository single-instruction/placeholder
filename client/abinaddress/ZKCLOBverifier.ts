export const ZKCLOBverifierabi=[
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "identityVerificationHubV2Address",
          "type": "address",
          "internalType": "address"
        },
        { "name": "scope", "type": "string", "internalType": "string" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getConfigId",
      "inputs": [
        { "name": "", "type": "bytes32", "internalType": "bytes32" },
        { "name": "", "type": "bytes32", "internalType": "bytes32" },
        { "name": "", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isUserVerified",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "onVerificationSuccess",
      "inputs": [
        { "name": "output", "type": "bytes", "internalType": "bytes" },
        { "name": "userData", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "scope",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "setConfigId",
      "inputs": [
        { "name": "configId", "type": "bytes32", "internalType": "bytes32" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "toggleVerification",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "verificationActive",
      "inputs": [],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "verificationConfigId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "bytes32", "internalType": "bytes32" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "verifiedAddresses",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "verifySelfProof",
      "inputs": [
        { "name": "proofPayload", "type": "bytes", "internalType": "bytes" },
        { "name": "userContextData", "type": "bytes", "internalType": "bytes" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "UserVerified",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "output",
          "type": "tuple",
          "indexed": false,
          "internalType": "struct ISelfVerificationRoot.GenericDiscloseOutputV2",
          "components": [
            {
              "name": "attestationId",
              "type": "bytes32",
              "internalType": "bytes32"
            },
            {
              "name": "userIdentifier",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "nullifier",
              "type": "uint256",
              "internalType": "uint256"
            },
            {
              "name": "forbiddenCountriesListPacked",
              "type": "uint256[4]",
              "internalType": "uint256[4]"
            },
            {
              "name": "issuingState",
              "type": "string",
              "internalType": "string"
            },
            { "name": "name", "type": "string[]", "internalType": "string[]" },
            { "name": "idNumber", "type": "string", "internalType": "string" },
            {
              "name": "nationality",
              "type": "string",
              "internalType": "string"
            },
            {
              "name": "dateOfBirth",
              "type": "string",
              "internalType": "string"
            },
            { "name": "gender", "type": "string", "internalType": "string" },
            {
              "name": "expiryDate",
              "type": "string",
              "internalType": "string"
            },
            {
              "name": "olderThan",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "ofac", "type": "bool[3]", "internalType": "bool[3]" }
          ]
        },
        {
          "name": "userData",
          "type": "bytes",
          "indexed": false,
          "internalType": "bytes"
        }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "InvalidDataFormat", "inputs": [] },
    { "type": "error", "name": "UnauthorizedCaller", "inputs": [] }
  ]
export const ZKCLOBverifieraddress="0xcf4c5064162bc944781cf36f75d037036c35665a"