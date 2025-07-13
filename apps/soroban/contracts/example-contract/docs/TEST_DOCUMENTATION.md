# StarProof Certificate Verification Contract Test Documentation

## Overview

This document describes the test suite for the StarProof Certificate Verification smart contract. The tests ensure that the contract correctly implements certificate verification functionality.

## Test Structure

The test file (`test.rs`) contains unit tests that validate the contract's behavior using Rust's testing framework and the Soroban SDK's testing utilities.

## Test Cases

### `test_verify_certificate()`

**Description:**  
This test verifies that a certificate can be correctly verified when the provided metadata hash matches the stored hash.

**Test Steps:**
1. Set up a mock Certificate contract with a valid certificate
2. Call the `verify_certificate` function with the correct certificate ID and metadata hash
3. Verify that the function returns a valid verification result

**Expected Result:**  
The function should return a verification result indicating that the certificate is valid.

### `test_verify_revoked_certificate()`

**Description:**  
This test verifies that a revoked certificate is correctly identified during verification.

**Test Steps:**
1. Set up a mock Certificate contract with a revoked certificate
2. Call the `verify_certificate` function with the certificate ID
3. Verify that the function returns a revoked verification result

**Expected Result:**  
The function should return a verification result indicating that the certificate has been revoked.

### `test_verify_with_incorrect_hash()`

**Description:**  
This test verifies that a certificate with a mismatched metadata hash is correctly identified as invalid.

**Test Steps:**
1. Set up a mock Certificate contract with a valid certificate
2. Call the `verify_certificate` function with the correct certificate ID but an incorrect metadata hash
3. Verify that the function returns an invalid verification result

**Expected Result:**  
The function should return a verification result indicating that the certificate is invalid due to hash mismatch.

### `test_verify_nonexistent_certificate()`

**Description:**  
This test verifies that attempting to verify a nonexistent certificate returns an error.

**Test Steps:**
1. Set up a mock Certificate contract
2. Call the `verify_certificate` function with a nonexistent certificate ID
3. Verify that the function fails with a not found error

**Expected Result:**  
The function should fail with an error indicating that the certificate was not found.

### `test_batch_verify_certificates()`

**Description:**  
This test verifies that multiple certificates can be verified in a single transaction.

**Test Steps:**
1. Set up a mock Certificate contract with multiple certificates (valid, revoked, and invalid)
2. Call the `batch_verify_certificates` function with the certificate IDs and metadata hashes
3. Verify that the function returns the correct verification results for each certificate

**Expected Result:**  
The function should return a vector of verification results matching the expected status for each certificate.

### `test_get_verification_status()`

**Description:**  
This test verifies that the validity status of a certificate can be retrieved correctly.

**Test Steps:**
1. Set up a mock Certificate contract with both valid and revoked certificates
2. Call the `get_verification_status` function for each certificate
3. Verify that the function returns the correct validity status for each certificate

**Expected Result:**  
The function should return true for valid certificates and false for revoked certificates.

## Test Environment Setup

The tests use:
- `Env::default()` to create a simulated blockchain environment
- Mock contracts to simulate the main Certificate contract
- `ContractClient::new()` to create a client for interacting with the contract

## Running the Tests

Tests can be executed using the standard Cargo test command:

```bash
cargo test
```

Or using the provided Makefile:

```bash
make test
```

## Test Coverage

The current test suite covers:
- Certificate verification with correct and incorrect metadata hashes
- Verification of revoked certificates
- Batch verification of multiple certificates
- Simple status verification
- Error handling for nonexistent certificates

## Future Test Enhancements

To improve test coverage, consider adding:
- Tests for edge cases (empty strings, special characters in certificate IDs)
- Performance tests for batch verification with large numbers of certificates
- Integration tests with the actual Certificate contract (not just mocks)
- Tests for handling malformed input data
