# StarProof Soroban Smart Contracts

## Overview

This directory contains the Soroban smart contracts that power the StarProof certificate verification platform. These contracts enable the issuance, verification, and revocation of digital certificates on the Stellar blockchain.

## Purpose

The StarProof smart contracts serve as the blockchain backend for a platform that acts as an intermediary between verifying entities and users. They provide a secure, immutable, and transparent way to manage digital certificates without requiring end users to understand blockchain technology.

## Smart Contract Functionality

### Core Functions

- **Initialization**: Sets up the contract with administrator privileges to control certificate management
- **Certificate Issuance**: Registers new certificates with unique IDs, owner information, and metadata
- **Certificate Verification**: Allows public verification of certificate validity and authenticity
- **Certificate Revocation**: Enables administrators to invalidate certificates when necessary

### Data Structure

Certificates are stored in the contract using a map data structure with the following properties:
- Certificate ID (String): Unique identifier for each certificate
- Owner (Address): The Stellar address of the certificate recipient
- Metadata Hash (String): Hash of the certificate's metadata for verification
- Status (Boolean): Indicates whether the certificate is valid or revoked

## Development

### Prerequisites

- Rust toolchain
- Soroban CLI
- Stellar account (for testnet deployment)

### Building

Each contract directory contains a Makefile with commands for building and testing:

```bash
# Build the contract
make build

# Run tests
make test
```

### Deployment

Contracts are deployed to the Stellar testnet for functional testing:

```bash
# Deploy to testnet
make deploy
```

## Integration

These smart contracts are designed to be called from the StarProof web interface, which provides forms for certificate issuance, verification, and revocation. The web interface handles the complexity of blockchain interactions, making the system accessible to non-technical users.

## Security Considerations

- Administrator access is controlled through Stellar account authentication
- Certificate data integrity is ensured through cryptographic hashing
- The contract implements access controls to prevent unauthorized certificate manipulation

## Documentation

Detailed documentation for each smart contract and its test suite can be found in the respective contract's `docs` directory.
