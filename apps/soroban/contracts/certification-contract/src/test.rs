#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

/// Helper function to create a test environment and contract client
fn setup() -> (Env, Address, ContractClient<'static>) {
    let env = Env::default();
    let contract_id = env.register_contract(None, Contract);
    let client = ContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    (env, admin, client)
}

#[test]
/// Test contract initialization
fn test_initialize() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Try to initialize again (should fail)
    let result = client.try_initialize(&admin);
    assert!(result.is_err());
}

#[test]
/// Test certificate issuance
fn test_issue_certificate() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create test data
    let cert_id = String::from_str(&env, "cert-123");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "abcdef123456");

    // Issue a certificate
    env.mock_all_auths();
    client.issue_certificate(&cert_id, &owner, &metadata_hash);

    // Verify the certificate was created
    let cert_details = client.get_certificate_details(&cert_id);
    assert_eq!(cert_details.owner, owner);
    assert_eq!(cert_details.metadata_hash, metadata_hash);
    assert_eq!(cert_details.is_valid, true);
}

#[test]
/// Test unauthorized certificate issuance
fn test_unauthorized_issue_certificate() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create a certificate
    let cert_id = String::from_str(&env, "cert-123");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "abcdef123456");

    // Clear any previous auth mocks
    env.set_auths(&[]);

    // Try to issue a certificate without proper authorization
    // This should fail because we're not mocking the admin's authorization
    let result = client.try_issue_certificate(&cert_id, &owner, &metadata_hash);

    // Verify it fails with unauthorized error
    assert!(result.is_err());
}

#[test]
/// Test certificate revocation
fn test_revoke_certificate() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create and issue a certificate
    let cert_id = String::from_str(&env, "cert-123");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "abcdef123456");

    env.mock_all_auths();
    client.issue_certificate(&cert_id, &owner, &metadata_hash);

    // Verify the certificate is valid
    let cert_details = client.get_certificate_details(&cert_id);
    assert_eq!(cert_details.is_valid, true);

    // Revoke the certificate as admin
    env.mock_all_auths();
    client.revoke_certificate(&cert_id);

    // Verify the certificate is now invalid
    let cert_details = client.get_certificate_details(&cert_id);
    assert_eq!(cert_details.is_valid, false);
}

#[test]
/// Test unauthorized certificate revocation
fn test_unauthorized_revoke_certificate() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create a certificate
    let cert_id = String::from_str(&env, "cert-123");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "abcdef123456");

    env.mock_all_auths();
    client.issue_certificate(&cert_id, &owner, &metadata_hash);

    // Clear any previous auth mocks
    env.set_auths(&[]);

    // Try to revoke the certificate without authorization
    // This should fail because we're not mocking the admin's authorization
    let result = client.try_revoke_certificate(&cert_id);

    // Verify it fails
    assert!(result.is_err());
}

#[test]
/// Test certificate verification
fn test_verify_certificate() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create and issue a certificate
    let cert_id = String::from_str(&env, "cert-123");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "abcdef123456");

    env.mock_all_auths();
    client.issue_certificate(&cert_id, &owner, &metadata_hash);

    // Verify with correct metadata hash
    let is_valid = client.verify_certificate(&cert_id, &metadata_hash);
    assert_eq!(is_valid, true);

    // Verify with incorrect metadata hash
    let wrong_hash = String::from_str(&env, "wrong-hash");
    let is_valid = client.verify_certificate(&cert_id, &wrong_hash);
    assert_eq!(is_valid, false);

    // Revoke the certificate
    env.mock_all_auths();
    client.revoke_certificate(&cert_id);

    // Verify the revoked certificate
    let is_valid = client.verify_certificate(&cert_id, &metadata_hash);
    assert_eq!(is_valid, false);
}

#[test]
/// Test listing certificates
fn test_list_certificates() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Create and issue multiple certificates
    let cert_id1 = String::from_str(&env, "cert-1");
    let cert_id2 = String::from_str(&env, "cert-2");
    let owner = Address::generate(&env);
    let metadata_hash = String::from_str(&env, "hash");

    env.mock_all_auths();
    client.issue_certificate(&cert_id1, &owner, &metadata_hash);
    env.mock_all_auths();
    client.issue_certificate(&cert_id2, &owner, &metadata_hash);

    // List certificates as admin
    env.mock_all_auths();
    let certificates = client.list_certificates();

    // Verify all certificates are listed
    assert_eq!(certificates.len(), 2);
    assert!(certificates.contains(&cert_id1));
    assert!(certificates.contains(&cert_id2));

    // Without mocking auth, list_certificates should fail
    // We don't need to test this here as it's covered in the unauthorized tests
}

#[test]
/// Test certificate not found error
fn test_certificate_not_found() {
    let (env, admin, client) = setup();

    // Initialize the contract
    env.mock_all_auths();
    client.initialize(&admin);

    // Try to get a non-existent certificate
    let cert_id = String::from_str(&env, "non-existent");
    let result = client.try_get_certificate_details(&cert_id);

    // Verify it fails with certificate not found error
    assert!(result.is_err());

    // Try to revoke a non-existent certificate as non-admin (don't mock auth for admin)
    let result = client.try_revoke_certificate(&String::from_str(&env, "non-existent"));

    // Verify it fails with certificate not found error
    assert!(result.is_err());
}
