# StarProof Certificate Verification Contract

## Overview

The Certificate Verification smart contract is a complementary component of the StarProof platform, focused specifically on the verification aspects of digital certificates on the Stellar blockchain using Soroban.

## Contract Structure

The contract is implemented in Rust using the Soroban SDK and consists of:

- A `Contract` struct that serves as the main contract entity
- Read-only functions for certificate verification
- Integration with the main Certificate contract for data access

## Functions

### `verify_certificate(env: Env, cert_id: String, metadata_hash: String) -> Result<VerificationResult, Error>`

**Description:**  
Verifies a certificate by checking its existence, validity status, and metadata hash match. This function is public and can be called by anyone.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to verify
- `metadata_hash`: The hash of the certificate's metadata to compare against the stored hash

**Returns:**  
A Result containing the verification result (valid, revoked, or invalid) or an error if the certificate doesn't exist

### `batch_verify_certificates(env: Env, cert_ids: Vec<String>, metadata_hashes: Vec<String>) -> Result<Vec<VerificationResult>, Error>`

**Description:**  
Verifies multiple certificates in a single transaction for efficiency. This is useful for verifying a batch of related certificates.

**Parameters:**
- `env`: The Soroban environment object
- `cert_ids`: A vector of certificate IDs to verify
- `metadata_hashes`: A vector of metadata hashes corresponding to each certificate ID

**Returns:**  
A Result containing a vector of verification results for each certificate or an error if the input vectors have different lengths

### `get_verification_status(env: Env, cert_id: String) -> Result<bool, Error>`

**Description:**  
Returns only the validity status of a certificate without checking the metadata hash. This is a simpler verification that just confirms if a certificate exists and hasn't been revoked.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to check

**Returns:**  
A Result containing the validity status (true for valid, false for revoked) or an error if the certificate doesn't exist

## Integration with Main Certificate Contract

This contract interacts with the main Certificate contract to access certificate data. It uses cross-contract calls to retrieve certificate details while providing specialized verification functionality.

## Security Considerations

- All functions are read-only and don't modify contract state
- The contract validates inputs to prevent malformed data
- Verification results are cryptographically secure through hash comparison

## Integration with StarProof Platform

This contract is designed to be called from the StarProof web interface's verification form. It provides a simple way for users to verify certificates without needing to understand the underlying blockchain technology.
