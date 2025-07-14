# StarProof Certificate Contract

## Overview

The StarProof Certificate Contract is a Soroban-based smart contract deployed on the Stellar blockchain that provides a secure, transparent, and immutable system for digital certificate management. This contract serves as the core infrastructure for the StarProof platform, enabling organizations to issue, verify, and manage cryptographically secured digital credentials with full auditability and tamper resistance.

## General Features

- **Decentralized Certificate Management**: Issue and manage certificates on the Stellar blockchain without reliance on centralized authorities
- **Immutable Record Keeping**: All certificate issuances and status changes are permanently recorded on the blockchain
- **Role-Based Access Control**: Administrative functions are protected by robust authorization mechanisms
- **Certificate Verification**: On-chain verification of certificate authenticity and validity status
- **WebAssembly Compatibility**: Optimized for deployment on Stellar's Soroban WebAssembly runtime
- **Standards Compliance**: Follows Soroban SDK best practices and patterns

## Functionalities

### Core Operations
- Certificate issuance with unique identifiers
- Certificate verification against stored metadata
- Certificate revocation by authorized administrators
- Certificate status querying
- Listing of all issued certificates

### Administrative Controls
- Contract initialization with administrator designation
- Strict access control for sensitive operations
- Validation of certificate uniqueness and data integrity

## Contract Structure

The contract is architected using Rust and the Soroban SDK with the following key components:

### Data Structures

```rust
#[contracttype]
pub struct CertificateDetails {
    pub owner: Address,
    pub metadata_hash: String,
    pub is_valid: bool,
}
```

### Storage Keys

```rust
const ADMIN: Symbol = symbol_short!("ADMIN");
const CERTIFICATES: Symbol = symbol_short!("CERTS");
```

### Error Handling

```rust
#[contracterror]
pub enum Error {
    Unauthorized = 1,
    CertificateAlreadyExists = 2,
    CertificateNotFound = 3,
    AlreadyInitialized = 4
}
```

## Events

The contract does not explicitly emit events, as Soroban's transaction records provide inherent auditability. All state changes are recorded on the Stellar blockchain and can be queried through the following operations:

- Certificate issuance events (tracked through contract state changes)
- Certificate revocation events (tracked through validity status changes)
- Administrative actions (tracked through transaction records)

## Functions

### Administrative Functions

#### `initialize(env: Env, admin: Address) -> Result<(), Error>`

**Description:**  
Initializes the contract with the administrator address. This function can only be called once when the contract is first deployed.

**Parameters:**
- `env`: The Soroban environment object
- `admin`: The Stellar address that will have administrator privileges

**Returns:**  
A Result indicating success or an error if initialization fails (Error::AlreadyInitialized)

**Access Control:**  
No specific authorization required, but can only be called once

#### `issue_certificate(env: Env, cert_id: String, owner: Address, metadata_hash: String) -> Result<(), Error>`

**Description:**  
Registers a new certificate with the provided details. Creates a permanent record of the certificate on the blockchain with its associated metadata hash and sets it as valid.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: A unique identifier for the certificate
- `owner`: The Stellar address of the certificate recipient
- `metadata_hash`: A cryptographic hash of the certificate's metadata for verification

**Returns:**  
A Result indicating success or an error if the certificate already exists (Error::CertificateAlreadyExists) or the caller is not the administrator (Error::Unauthorized)

**Access Control:**  
Restricted to the administrator address. Requires authentication via `admin.require_auth()`

**Storage Impact:**  
Creates a new entry in the certificates map with the provided certificate ID as the key

#### `revoke_certificate(env: Env, cert_id: String) -> Result<(), Error>`

**Description:**  
Marks a certificate as revoked by setting its validity status to false. The certificate record remains on the blockchain but is flagged as invalid.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to revoke

**Returns:**  
A Result indicating success or an error if the certificate doesn't exist (Error::CertificateNotFound) or the caller is not the administrator (Error::Unauthorized)

**Access Control:**  
Restricted to the administrator address. Requires authentication via `admin.require_auth()`

**Storage Impact:**  
Updates the existing certificate record by changing the `is_valid` flag to false

### Query Functions

#### `get_certificate_details(env: Env, cert_id: String) -> Result<CertificateDetails, Error>`

**Description:**  
Retrieves the complete details of a certificate including owner address, metadata hash, and validity status.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to retrieve

**Returns:**  
A Result containing the certificate details (owner, metadata hash, and validity status) or an error if the certificate doesn't exist (Error::CertificateNotFound)

**Access Control:**  
Public function, can be called by any address

#### `verify_certificate(env: Env, cert_id: String, metadata_hash: String) -> Result<bool, Error>`

**Description:**  
Verifies if a certificate exists, is valid, and matches the provided metadata hash.

**Parameters:**
- `env`: The Soroban environment object
- `cert_id`: The unique identifier of the certificate to verify
- `metadata_hash`: The metadata hash to verify against the stored certificate

**Returns:**  
A Result containing a boolean (true if the certificate is valid and the hash matches) or an error if the certificate doesn't exist (Error::CertificateNotFound)

**Access Control:**  
Public function, can be called by any address

#### `list_certificates(env: Env) -> Vec<String>`

**Description:**  
Retrieves a list of all certificate IDs that have been issued.

**Parameters:**
- `env`: The Soroban environment object

**Returns:**  
A vector containing all certificate IDs stored in the contract

**Access Control:**  
Public function, can be called by any address

## Technical Details

### Storage Implementation

The contract uses Soroban's persistent storage with the following structure:

```rust
// Admin storage - Stores the administrator address
env.storage().instance().set(&ADMIN, &admin);
env.storage().instance().get(&ADMIN);

// Certificates storage - Map of certificate IDs to certificate details
let certificates = env.storage().instance().get_map(&CERTIFICATES);
certificates.set(&cert_id, &certificate_details);
certificates.get(&cert_id);
```

### Serialization

The contract uses Soroban's serialization framework for data storage and retrieval:

```rust
// The #[contracttype] attribute enables serialization/deserialization
#[contracttype]
pub struct CertificateDetails {
    pub owner: Address,
    pub metadata_hash: String,
    pub is_valid: bool,
}
```

### Error Handling

Errors are handled through a dedicated error enum with specific error codes:

```rust
#[contracterror]
pub enum Error {
    Unauthorized = 1,         // Caller is not the administrator
    CertificateAlreadyExists = 2,  // Certificate ID already in use
    CertificateNotFound = 3,   // Certificate ID does not exist
    AlreadyInitialized = 4     // Contract has already been initialized
}
```

## Implementation Notes

### Authentication Model

The contract implements a single-administrator model where one Stellar address has privileged access to administrative functions. This address is set during contract initialization and cannot be changed afterward without redeploying the contract.

Authentication is enforced using Soroban's `require_auth()` mechanism, which verifies that transaction signatures match the expected administrator address.

### Performance Considerations

- Certificate lookups are optimized using Soroban's map data structure for O(1) access time
- The contract minimizes storage operations to reduce execution costs
- Certificate IDs are stored as strings to provide flexibility and human-readability
- The `list_certificates` function may have higher gas costs as the number of certificates grows

### Upgrade Path

The current contract does not implement an upgrade mechanism. Future versions could incorporate:

- Contract migration capabilities
- Multi-administrator support
- Delegated certificate issuance
- Batch operations for certificate management

### Integration Guidelines

Client applications should:

1. Connect to a Soroban-compatible Stellar node
2. Use the contract ID to interact with certificate functions
3. Ensure proper authentication when calling administrative functions
4. Handle potential errors gracefully, especially for certificate existence checks
5. Store off-chain metadata securely, with only the hash recorded on-chain

The StarProof web interface abstracts these complexities, providing a user-friendly experience for certificate management.
