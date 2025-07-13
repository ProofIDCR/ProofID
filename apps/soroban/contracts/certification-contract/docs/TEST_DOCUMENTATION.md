# StarProof Certificate Contract Test Documentation

## Overview

This document describes the test suite for the StarProof Certificate smart contract. The tests ensure that the contract correctly implements certificate issuance, verification, and revocation functionality.

## Test Structure

The test file (`test.rs`) contains unit tests that validate the contract's behavior using Rust's testing framework and the Soroban SDK's testing utilities. The tests use Soroban's authentication mocking capabilities to properly test authorization requirements.

## Test Cases

### `test_initialization()`

**Description:**  
This test verifies that the contract initializes correctly with an administrator address.

**Test Steps:**
1. Create a default Soroban environment
2. Register the contract in the environment using `env.register_contract()`
3. Create a client to interact with the contract
4. Mock authorization using `env.mock_all_auths()`
5. Call the `initialize` function with an administrator address
6. Verify that initialization succeeds

**Expected Result:**  
The function should complete without errors, and the administrator should be set correctly.

### `test_issue_certificate()`

**Description:**  
This test verifies that an administrator can issue a certificate with the correct details.

**Test Steps:**
1. Initialize the contract with an administrator
2. Mock authorization using `env.mock_all_auths()` to simulate admin approval
3. Call the `issue_certificate` function
4. Verify that the certificate is issued with the correct details

**Expected Result:**  
The function should complete without errors, and the certificate should be stored with the provided details.

### `test_unauthorized_issue_certificate()`

**Description:**  
This test verifies that non-administrators cannot issue certificates.

**Test Steps:**
1. Initialize the contract with an administrator
2. Clear any authorization mocks using `env.set_auths(&[])`
3. Call the `issue_certificate` function without proper authorization
4. Verify that the function fails with an authorization error

**Expected Result:**  
The function should fail with an error indicating that the caller is not authorized.

### `test_revoke_certificate()`

**Description:**  
This test verifies that an administrator can revoke a certificate.

**Test Steps:**
1. Initialize the contract with an administrator
2. Mock authorization using `env.mock_all_auths()` to simulate admin approval
3. Issue a certificate
4. Mock authorization again for the revocation
5. Call the `revoke_certificate` function
6. Verify that the certificate is marked as revoked

**Expected Result:**  
The function should complete without errors, and the certificate's validity status should be set to false.

### `test_unauthorized_revoke_certificate()`

**Description:**  
This test verifies that non-administrators cannot revoke certificates.

**Test Steps:**
1. Initialize the contract with an administrator
2. Mock authorization to issue a certificate
3. Issue a certificate
4. Clear any authorization mocks using `env.set_auths(&[])`
5. Call the `revoke_certificate` function without proper authorization
6. Verify that the function fails with an authorization error

**Expected Result:**  
The function should fail with an error indicating that the caller is not authorized.

### `test_get_certificate_details()`

**Description:**  
This test verifies that anyone can retrieve certificate details.

**Test Steps:**
1. Initialize the contract with an administrator
2. Issue a certificate with known details
3. Call the `get_certificate_details` function
4. Verify that the returned details match the expected values

**Expected Result:**  
The function should return the correct certificate details, including owner, metadata hash, and validity status.

### `test_get_nonexistent_certificate()`

**Description:**  
This test verifies that attempting to retrieve a nonexistent certificate returns an error.

**Test Steps:**
1. Initialize the contract with an administrator
2. Call the `get_certificate_details` function with a nonexistent certificate ID
3. Verify that the function fails with a not found error

**Expected Result:**  
The function should fail with an error indicating that the certificate was not found.

## Test Environment Setup

The tests use:
- `Env::default()` to create a simulated blockchain environment
- `env.register_contract()` to deploy the contract to the test environment
- `ContractClient::new()` to create a client for interacting with the contract
- `env.mock_all_auths()` to simulate proper authorization for admin operations
- `env.set_auths(&[])` to clear authorization mocks for testing unauthorized access
- Various test accounts to simulate different users and administrators

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
- Contract initialization
- Certificate issuance (both authorized and unauthorized)
- Certificate revocation (both authorized and unauthorized)
- Certificate verification
- Error handling for nonexistent certificates

## Future Test Enhancements

To improve test coverage, consider adding:
- Tests for edge cases (empty strings, special characters in certificate IDs)
- Performance tests to measure resource usage
- Integration tests with the web interface
- Tests for concurrent certificate operations
- More granular authorization tests with specific invocation patterns
- Tests for contract upgrade scenarios
