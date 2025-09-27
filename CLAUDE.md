# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this zkCLOB (Zero-Knowledge Central Limit Order Book) monorepo.

## Project Overview

This is a comprehensive zkCLOB trading platform monorepo implementing privacy-preserving order matching with zero-knowledge proofs. The system combines:

- **Self.xyz integration** for zk-KYC verification
- **Circom circuits** for order authentication and privacy
- **SP1 zkVM** for batch settlement proofs
- **Next.js frontend** for user interface
- **Ethereum smart contracts** for on-chain verification

The platform enables private trading where users can place orders without revealing their identity while maintaining regulatory compliance through zk-KYC.

## Architecture

### Submodules Structure

```
├── client/                    # Next.js frontend application
├── self-placeholder/          # Self.xyz zk-KYC smart contracts
├── mopro-circuits/           # Circom circuits for order authentication
├── Sequencer-zkvm/           # SP1 zkVM for batch settlement proofs
└── CLAUDE.md                 # This file
```

## Development Commands

### Root Level Setup
```shell
# Initialize and update all submodules
git submodule init && git submodule update

# Update all submodules to latest
git submodule update --remote
```

### Frontend (client/)
```shell
cd client
npm install
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run lint         # ESLint checking
```

### Smart Contracts (self-placeholder/)
```shell
cd self-placeholder
npm install
forge build          # Compile contracts
forge test           # Run tests
forge fmt            # Format code
anvil                # Local dev node

# Deploy to Celo Sepolia
forge script script/DeployZKCLOBVerifier.s.sol --rpc-url celo-sepolia --private-key $PRIVATE_KEY --broadcast

# Deploy to Celo Mainnet
forge script script/DeployZKCLOBVerifier.s.sol --rpc-url celo --private-key $PRIVATE_KEY --broadcast
```

### Circuits (mopro-circuits/)
```shell
cd mopro-circuits
yarn install
yarn build-all       # Build all circuits
yarn test            # Run circuit tests
yarn format          # Format code
```

### zkVM (Sequencer-zkvm/)
```shell
cd Sequencer-zkvm
cargo build --release

# Execute program without proof
cd script && cargo run --release -- --execute

# Generate SP1 core proof
cd script && cargo run --release -- --prove

# Generate EVM-compatible Groth16 proof
cd script && cargo run --release --bin evm -- --system groth16

# Generate PLONK proof
cd script && cargo run --release --bin evm -- --system plonk

# Get verification key
cd script && cargo run --release --bin vkey
```

## Component Details

### 1. Frontend (client/)
- **Framework**: Next.js 15 with Turbopack
- **Styling**: Tailwind CSS with custom glass-morphism effects
- **Web3**: wagmi v2, RainbowKit, ethers v6
- **Self.xyz**: @selfxyz/core, @selfxyz/qrcode for zk-KYC
- **UI**: Radix UI components with custom styling

**Key Features**:
- KYC verification flow with Self.xyz
- Trading dashboard with order book
- Chart visualization with recharts
- Responsive design with animated components

### 2. Smart Contracts (self-placeholder/)
- **Framework**: Foundry with Solidity 0.8.28
- **Networks**: Celo Sepolia (testnet), Celo Mainnet
- **Integration**: Self.xyz Protocol Hub V2

**Key Contracts**:
- `ZKCLOBVerifier.sol`: Main KYC verification contract
  - Extends `SelfVerificationRoot`
  - Emits `UserVerified` events
  - Manages verification configuration (age 18+, OFAC enabled)
  - Hub addresses:
    - Celo Sepolia: `0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74`
    - Celo Mainnet: `0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF`

### 3. Circuits (mopro-circuits/)
- **Framework**: Circom 2.1.6+
- **Cryptography**: Poseidon hashing, BabyJub EdDSA

**Key Circuits**:
- `order_auth.circom`: Order authentication with EdDSA signatures
  - Public inputs: structHash, pair_id_hash, side, price_tick, amount, time_bucket, nonce
  - Private inputs: EdDSA signature components (A_bits, R8_bits, S_bits), epoch
  - Outputs: circuit_version, order_hash, nullifier
- `client.circom`: Main circuit wrapper
- `passport/`: Passport verification circuits (age, validity checks)
- `utils/`: Cryptographic primitives (ECDSA, RSA, hashing, Merkle trees)

### 4. zkVM (Sequencer-zkvm/)
- **Framework**: SP1 zkVM for RISC-V proof generation
- **Language**: Rust with workspace structure

**Components**:
- `program/`: Core zkVM program (fibonacci example, can be extended)
- `script/`: Proof generation and verification scripts
- `lib/`: Shared library code
- `contracts/`: Solidity verifier contracts

## Integration Flow

### 1. User Onboarding
1. User connects wallet to frontend
2. User scans QR code or opens Self.xyz app
3. Self.xyz performs zk-KYC verification
4. ZKCLOBVerifier contract emits `UserVerified` event
5. Frontend detects verification and enables trading

### 2. Order Placement (Privacy-Preserving)
1. User creates order in frontend
2. Order is signed with EdDSA private key
3. Order authentication circuit generates proof
4. Proof includes nullifier to prevent replay attacks
5. Order hash commits to exact order parameters

### 3. Batch Settlement
1. Sequencer collects multiple orders
2. Orders are matched in zkVM program
3. SP1 generates proof of correct settlement
4. Proof is verified on-chain
5. User balances are updated atomically

## Security Features

### Privacy
- Orders are authenticated with zero-knowledge proofs
- User identities are hidden during trading
- Only settlement results are public

### Compliance
- zk-KYC ensures regulatory compliance
- Age verification (18+ requirement)
- OFAC screening enabled
- Anti-replay protection with nullifiers

### Cryptographic Security
- EdDSA signatures for order authentication
- Poseidon hashing for efficiency in circuits
- SP1 zkVM for complex computation verification

## Environment Variables

### Frontend (.env.local)
```shell
NEXT_PUBLIC_SELF_APP_NAME="zkCLOB Exchange"
NEXT_PUBLIC_SELF_SCOPE="zkclob-kyc"
NEXT_PUBLIC_SELF_ENDPOINT="https://staging-api.self.xyz"
```

### Smart Contracts
```shell
PRIVATE_KEY=your_deployment_private_key
```

### SP1 zkVM (.env)
```shell
SP1_PROVER=network  # Use Succinct Prover Network
NETWORK_PRIVATE_KEY=your_prover_network_key
```

## Testing

### Circuit Testing
```shell
cd mopro-circuits
yarn test                    # All tests
yarn test-register          # Registration tests
yarn test-disclose          # Disclosure tests
yarn test-ecdsa            # ECDSA verification tests
```

### Contract Testing
```shell
cd self-placeholder
forge test                  # All contract tests
forge test --match-test testVerification  # Specific test
```

### Frontend Testing
```shell
cd client
npm run lint               # ESLint checking
```

## Deployment

### 1. Deploy Smart Contracts
```shell
cd self-placeholder
forge script script/DeployZKCLOBVerifier.s.sol --rpc-url celo-sepolia --private-key $PRIVATE_KEY --broadcast --verify
```

### 2. Build and Deploy Circuits
```shell
cd mopro-circuits
yarn build-all
# Deploy circuit artifacts to hosting service
```

### 3. Deploy Frontend
```shell
cd client
npm run build
# Deploy to Vercel, Netlify, or similar
```

## Important Notes

### Circuit Development
- Circuits require significant RAM (8GB+ recommended)
- Proof generation is computationally intensive
- Use deterministic randomness for reproducible testing

### Self.xyz Integration
- Requires proper configuration of scope and endpoints
- Test with staging environment first
- Monitor verification events for frontend state

### SP1 zkVM
- Requires 16GB+ RAM for Groth16/PLONK proofs
- Consider using Succinct Prover Network for production
- Fibonacci example should be replaced with actual settlement logic

## Troubleshooting

### Common Issues
1. **Submodule initialization fails**: Check git access to repositories
2. **Circuit compilation errors**: Ensure Circom is properly installed
3. **SP1 proof generation fails**: Check RAM availability and dependencies
4. **Self.xyz verification fails**: Verify scope configuration and network connectivity

### Development Tips
- Use `anvil` for local blockchain testing
- Test circuits incrementally with smaller inputs
- Monitor gas costs for on-chain verification
- Keep private keys secure and use environment variables

## Security Considerations

⚠️ **Important Security Notes**:
- Never commit private keys to version control
- Use hardware wallets for mainnet deployments
- Audit all circuits before production use
- Implement proper access controls
- Monitor for unusual activity patterns
- Keep dependencies updated
- Use secure random number generation

This monorepo implements a complete privacy-preserving trading platform with regulatory compliance through zero-knowledge proofs.