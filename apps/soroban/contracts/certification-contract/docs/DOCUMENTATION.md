# StarProof Certificate Contract

## Overview

The Certificate smart contract is the core component of the StarProof platform, enabling the issuance, verification, and revocation of digital certificates on the Stellar blockchain using Soroban. This contract is WebAssembly-compatible and implements proper authentication mechanisms for secure certificate management.

## Contract Structure

The contract is implemented in Rust using the Soroban SDK and consists of:

- A `Contract` struct that serves as the main contract entity
- A `CertificateDetails` struct with the `#[contracttype]` attribute for serialization
- Storage maps for certificates and administrator access using Soroban's persistent storage
- Functions for certificate lifecycle management with proper authentication

## Functions

### `initialize(env: Env, admin: Address) -> Result<(), Error>`

**Description:**  
Initializes the contract with the administrator address. This can only be called once when the contract is first deployed.

**Parameters:**
- `env`: The Soroban environment object
- `admin`: The Stellar address that will have administrator privileges

**Returns:**  
A Result indicating success or an error if initialization fails (Error::AlreadyInitialized)

### `issue_certificate(env: Env, cert_id: String, owner: Address, metadata_hash: String) -> Result<(), Error>`

**Description:**  
Registers a new certificate with the provided details. Only the administrator can issue certificates. The function requires authentication from the admin address using `require_auth()`.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: A unique identifier for the certificate
- `owner`: The Stellar address of the certificate recipient
- `metadata_hash`: A hash of the certificate's metadata for verification

**Returns:**  
A Result indicating success or an error if the certificate already exists (Error::CertificateAlreadyExists) or the caller is not the administrator (Error::Unauthorized)

### `revoke_certificate(env: Env, cert_id: String) -> Result<(), Error>`

**Description:**  
Marks a certificate as revoked. Only the administrator can revoke certificates. The function requires authentication from the admin address using `require_auth()`.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to revoke

**Returns:**  
A Result indicating success or an error if the certificate doesn't exist (Error::CertificateNotFound) or the caller is not the administrator (Error::Unauthorized)

### `get_certificate_details(env: Env, cert_id: String) -> Result<CertificateDetails, Error>`

**Description:**  
Retrieves the details of a certificate. This function is public and can be called by anyone.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to retrieve

**Returns:**  
A Result containing the certificate details (owner, metadata hash, and validity status) or an error if the certificate doesn't exist (Error::CertificateNotFound)

## Data Storage

Certificates are stored in a map with the following structure:
```rust
// Storage keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const CERTIFICATES: Symbol = symbol_short!("CERTS");

// Certificate details structure
#[contracttype]
pub struct CertificateDetails {
    pub owner: Address,
    pub metadata_hash: String,
    pub is_valid: bool,
}

// Storage implementation
env.storage().instance().set(&ADMIN, &admin);
env.storage().instance().get(&CERTIFICATES).get(&cert_id);
```

Where:
- `ADMIN`: Storage key for the administrator address
- `CERTIFICATES`: Storage key for the certificates map
- `CertificateDetails`: Structure containing certificate information
  - `owner`: The Stellar address of the certificate recipient
  - `metadata_hash`: A hash of the certificate's metadata
  - `is_valid`: Certificate validity status (true for valid, false for revoked)

## Security Considerations

- Access control is implemented using Soroban's `require_auth()` mechanism to ensure only the administrator can issue and revoke certificates
- Authentication is enforced for all sensitive operations (issuance and revocation)
- Certificate IDs must be unique to prevent overwriting existing certificates
- The contract validates inputs to prevent malformed data
- The contract is WebAssembly-compatible for deployment on the Stellar blockchain

## Integration with StarProof Platform

This contract is designed to be called from the StarProof web interface, which provides forms for certificate issuance, verification, and revocation. The web interface handles the complexity of blockchain interactions, making the system accessible to non-technical users.

## Testing

The contract includes comprehensive unit tests that verify:
- Proper initialization
- Certificate issuance and retrieval
- Certificate verification against metadata hashes
- Certificate revocation
- Access control for administrative functions
- Error handling for various edge cases

Tests use Soroban's testing utilities, including authorization mocking with `env.mock_all_auths()` to simulate proper authentication.
