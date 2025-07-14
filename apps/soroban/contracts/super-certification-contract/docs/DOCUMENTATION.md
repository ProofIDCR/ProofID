# SuperCertification Contract Documentation

## Overview

The SuperCertification Contract is an advanced smart contract built on the Stellar blockchain using the Soroban framework. It provides a comprehensive solution for issuing, managing, and verifying digital certificates with enhanced security, flexibility, and functionality. This contract extends the basic certification capabilities with role-based access control, multiple certification authorities, rich metadata, and advanced certificate lifecycle management.

## General Features

- **Modular Architecture**: Clean separation of concerns across multiple modules
- **Role-Based Access Control**: Granular permissions with multiple roles
- **Multiple Certification Authorities**: Support for decentralized certificate issuance
- **Rich Certificate Metadata**: Comprehensive certificate information storage
- **Certificate Types**: Support for various certificate classifications
- **Certificate Lifecycle Management**: Full status tracking from issuance to expiration
- **Digital Signature Verification**: Cryptographic verification of certificate authenticity
- **Batch Operations**: Efficient processing of multiple certificates
- **Event Emission**: Comprehensive event logging for all state changes
- **Comprehensive Error Handling**: Detailed error reporting

## Functionalities

### Core Operations

- **Certificate Issuance**: Create new certificates with detailed metadata
- **Certificate Verification**: Verify the authenticity and validity of certificates
- **Certificate Revocation**: Invalidate certificates with optional reason
- **Certificate Transfer**: Transfer certificate ownership between addresses
- **Certificate Status Management**: Update certificate status (active, revoked, expired, suspended)
- **Certificate Metadata Updates**: Modify certificate information with versioning

### Administrative Controls

- **Authority Management**: Add and update certification authorities
- **Role Management**: Grant and revoke roles to addresses
- **Batch Certificate Issuance**: Issue multiple certificates in a single transaction

## Contract Structure

### Data Structures

#### Certificate Details
```rust
pub struct CertificateDetails {
    pub owner: Address,
    pub issuer: Address,
    pub metadata_hash: String,
    pub metadata: CertificateMetadata,
    pub status: CertificateStatus,
    pub signature: BytesN<64>,
    pub version: u32,
    pub revocation_reason: Option<String>,
    pub last_updated: u64,
}
```

#### Certificate Metadata
```rust
pub struct CertificateMetadata {
    pub title: String,
    pub description: String,
    pub issue_date: u64,
    pub expiration_date: u64,
    pub cert_type: CertificateType,
    pub custom_fields: Map<String, String>,
}
```

#### Certificate Types
```rust
pub enum CertificateType {
    Standard = 0,
    Professional = 1,
    Academic = 2,
    Technical = 3,
    Membership = 4,
    Custom = 5,
}
```

#### Certificate Status
```rust
pub enum CertificateStatus {
    Active = 0,
    Revoked = 1,
    Expired = 2,
    Suspended = 3,
}
```

#### Certification Authority
```rust
pub struct CertificationAuthority {
    pub name: String,
    pub address: Address,
    pub verification_key: BytesN<32>,
    pub is_active: bool,
}
```

#### Verification Result
```rust
pub struct VerificationResult {
    pub exists: bool,
    pub is_valid: bool,
    pub hash_valid: bool,
    pub signature_valid: bool,
    pub status: Option<CertificateStatus>,
    pub owner: Option<Address>,
    pub issuer: Option<Address>,
}
```

### Storage Keys

The contract uses the following storage keys:
- `ADMIN`: Stores the administrator address
- `CERTIFICATES`: Stores the certificates map
- `AUTHORITIES`: Stores the certification authorities map
- `ROLES`: Stores the role assignments map
- `CONFIG`: Stores contract configuration
- `VERSION`: Stores the contract version

### Error Handling

The contract defines comprehensive error types to provide clear feedback on operation failures:

```rust
pub enum Error {
    Unauthorized = 1,
    CertificateAlreadyExists = 2,
    CertificateNotFound = 3,
    AlreadyInitialized = 4,
    AuthorityAlreadyExists = 5,
    AuthorityNotFound = 6,
    AuthorityInactive = 7,
    CertificateExpired = 8,
    CertificateRevoked = 9,
    CertificateSuspended = 10,
    VerificationFailed = 11,
    InvalidSignature = 12,
    InvalidMetadata = 13,
    RoleAlreadyExists = 14,
    RoleNotFound = 15,
    BatchOperationFailed = 16,
    InvalidCertificateType = 17,
    InvalidCertificateStatus = 18,
    OperationNotSupported = 19,
    InvalidParameter = 20,
}
```

## Events

The contract emits events to record important state changes and operations:

- `CERTIFICATE_ISSUED`: When a new certificate is issued
- `CERTIFICATE_REVOKED`: When a certificate is revoked
- `STATUS_CHANGED`: When a certificate's status changes
- `AUTHORITY_ADDED`: When a new certification authority is added
- `AUTHORITY_UPDATED`: When a certification authority is updated
- `ROLE_GRANTED`: When a role is granted to an address
- `ROLE_REVOKED`: When a role is revoked from an address
- `CONTRACT_UPGRADED`: When the contract is upgraded

## Functions

### Initialization

#### `initialize(env: Env, admin: Address) -> Result<(), Error>`
Initializes the contract with an administrator address.

- **Parameters**:
  - `env`: The environment object
  - `admin`: The address of the administrator
- **Returns**: Success or an error
- **Access Control**: None (can only be called once)
- **Storage Impact**: Sets the admin address and initializes storage

### Certificate Management

#### `issue_certificate(env: Env, cert_id: String, owner: Address, metadata: CertificateMetadata, signature: BytesN<64>) -> Result<(), Error>`
Issues a new certificate.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `owner`: The address of the certificate owner
  - `metadata`: The certificate metadata
  - `signature`: Digital signature of the certificate
- **Returns**: Success or an error
- **Access Control**: Requires ISSUER role
- **Storage Impact**: Adds a new certificate to storage

#### `revoke_certificate(env: Env, cert_id: String, reason: Option<String>) -> Result<(), Error>`
Revokes an existing certificate.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `reason`: Optional reason for revocation
- **Returns**: Success or an error
- **Access Control**: Requires REVOKER role
- **Storage Impact**: Updates certificate status to revoked

#### `update_certificate_status(env: Env, cert_id: String, status: CertificateStatus, reason: Option<String>) -> Result<(), Error>`
Updates the status of a certificate.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `status`: The new status for the certificate
  - `reason`: Optional reason for the status change
- **Returns**: Success or an error
- **Access Control**: Requires ISSUER role
- **Storage Impact**: Updates certificate status

#### `update_certificate_metadata(env: Env, cert_id: String, metadata: CertificateMetadata, signature: BytesN<64>) -> Result<(), Error>`
Updates the metadata of a certificate.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `metadata`: The new metadata for the certificate
  - `signature`: Digital signature of the updated certificate
- **Returns**: Success or an error
- **Access Control**: Requires ISSUER role
- **Storage Impact**: Updates certificate metadata and increments version

#### `transfer_certificate(env: Env, cert_id: String, new_owner: Address) -> Result<(), Error>`
Transfers a certificate to a new owner.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `new_owner`: The address of the new owner
- **Returns**: Success or an error
- **Access Control**: Requires authorization from current owner
- **Storage Impact**: Updates certificate owner

### Certificate Queries

#### `get_certificate_details(env: Env, cert_id: String) -> Result<CertificateDetails, Error>`
Gets the details of a certificate.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
- **Returns**: Certificate details or an error
- **Access Control**: None
- **Storage Impact**: None (read-only)

#### `verify_certificate(env: Env, cert_id: String, metadata_hash: String) -> Result<VerificationResult, Error>`
Verifies a certificate by checking its existence, validity, and metadata hash.

- **Parameters**:
  - `env`: The environment object
  - `cert_id`: The unique identifier for the certificate
  - `metadata_hash`: The hash to verify against the stored metadata hash
- **Returns**: Detailed verification result
- **Access Control**: None
- **Storage Impact**: None (read-only)

#### `list_certificates(env: Env, start_after: Option<String>, limit: u32) -> Result<Vec<String>, Error>`
Lists all certificates with pagination.

- **Parameters**:
  - `env`: The environment object
  - `start_after`: Optional pagination parameter
  - `limit`: Maximum number of certificates to return
- **Returns**: A list of certificate IDs or an error
- **Access Control**: Requires ADMIN, ISSUER, or VERIFIER role
- **Storage Impact**: None (read-only)

#### `list_certificates_by_owner(env: Env, owner: Address) -> Vec<String>`
Lists certificates owned by a specific address.

- **Parameters**:
  - `env`: The environment object
  - `owner`: The address of the certificate owner
- **Returns**: A list of certificate IDs
- **Access Control**: None
- **Storage Impact**: None (read-only)

### Batch Operations

#### `batch_issue_certificates(env: Env, cert_ids: Vec<String>, owners: Vec<Address>, metadatas: Vec<CertificateMetadata>, signatures: Vec<BytesN<64>>) -> Result<Vec<bool>, Error>`
Batch issues multiple certificates.

- **Parameters**:
  - `env`: The environment object
  - `cert_ids`: The unique identifiers for the certificates
  - `owners`: The addresses of the certificate owners
  - `metadatas`: The certificate metadatas
  - `signatures`: Digital signatures of the certificates
- **Returns**: Success status for each certificate
- **Access Control**: Requires ISSUER role
- **Storage Impact**: Adds multiple certificates to storage

### Authority Management

#### `add_authority(env: Env, authority: Address, name: String, verification_key: BytesN<32>) -> Result<(), Error>`
Adds a new certification authority.

- **Parameters**:
  - `env`: The environment object
  - `authority`: The address of the authority
  - `name`: The name of the authority
  - `verification_key`: The public key used to verify signatures
- **Returns**: Success or an error
- **Access Control**: Requires AUTH_MANAGER role
- **Storage Impact**: Adds a new authority to storage

#### `update_authority(env: Env, authority: Address, name: String, verification_key: BytesN<32>, is_active: bool) -> Result<(), Error>`
Updates an existing certification authority.

- **Parameters**:
  - `env`: The environment object
  - `authority`: The address of the authority
  - `name`: The new name of the authority
  - `verification_key`: The new public key
  - `is_active`: Whether the authority is active
- **Returns**: Success or an error
- **Access Control**: Requires AUTH_MANAGER role
- **Storage Impact**: Updates authority details

#### `get_authority(env: Env, authority: Address) -> Result<CertificationAuthority, Error>`
Gets the details of a certification authority.

- **Parameters**:
  - `env`: The environment object
  - `authority`: The address of the authority
- **Returns**: Authority details or an error
- **Access Control**: None
- **Storage Impact**: None (read-only)

#### `list_authorities(env: Env) -> Vec<Address>`
Lists all certification authorities.

- **Parameters**:
  - `env`: The environment object
- **Returns**: A list of authority addresses
- **Access Control**: None
- **Storage Impact**: None (read-only)

### Role Management

#### `grant_role(env: Env, address: Address, role: Symbol) -> Result<(), Error>`
Grants a role to an address.

- **Parameters**:
  - `env`: The environment object
  - `address`: The address to grant the role to
  - `role`: The role to grant
- **Returns**: Success or an error
- **Access Control**: Requires ADMIN role
- **Storage Impact**: Updates roles map

#### `revoke_role(env: Env, address: Address, role: Symbol) -> Result<(), Error>`
Revokes a role from an address.

- **Parameters**:
  - `env`: The environment object
  - `address`: The address to revoke the role from
  - `role`: The role to revoke
- **Returns**: Success or an error
- **Access Control**: Requires ADMIN role
- **Storage Impact**: Updates roles map

#### `has_role(env: Env, address: Address, role: Symbol) -> bool`
Checks if an address has a specific role.

- **Parameters**:
  - `env`: The environment object
  - `address`: The address to check
  - `role`: The role to check for
- **Returns**: True if the address has the role, false otherwise
- **Access Control**: None
- **Storage Impact**: None (read-only)

#### `get_roles(env: Env, address: Address) -> Vec<Symbol>`
Gets all roles for an address.

- **Parameters**:
  - `env`: The environment object
  - `address`: The address to get roles for
- **Returns**: A list of roles for the address
- **Access Control**: None
- **Storage Impact**: None (read-only)

## Technical Details

### Storage Implementation

The contract uses Soroban's persistent storage for maintaining state:
- Instance storage for contract-wide data
- Map storage for collections of data

### Serialization

All data structures are marked with `#[contracttype]` to enable serialization and deserialization in Soroban.

### Error Handling

The contract uses the `#[contracterror]` attribute to define error types and provides detailed error messages for all operations.

### Event Emission

Events are emitted for all state-changing operations to provide an audit trail and enable external systems to react to contract state changes.

## Implementation Notes

### Authentication Model

The contract uses a role-based access control system with the following roles:
- `ADMIN`: Full access to all contract functions
- `ISSUER`: Can issue and update certificates
- `VERIFIER`: Can verify certificates and access certificate lists
- `REVOKER`: Can revoke certificates
- `AUTH_MANAGER`: Can manage certification authorities

### Performance Considerations

- Batch operations are provided for efficient processing of multiple certificates
- Pagination is implemented for listing functions to handle large datasets
- Storage is optimized to minimize blockchain resource usage

### Upgrade Path

The contract includes a version tracking mechanism to facilitate future upgrades while maintaining data integrity.

### Integration Guidelines

To integrate with this contract:
1. Deploy the contract using the provided Makefile
2. Initialize the contract with an admin address
3. Set up certification authorities and assign roles
4. Issue certificates using the `issue_certificate` function
5. Verify certificates using the `verify_certificate` function

## Security Considerations

- All sensitive operations require appropriate role authorization
- Digital signatures are used to ensure certificate authenticity
- Certificate status is tracked to prevent use of revoked or expired certificates
- Input validation is performed on all functions to prevent invalid data
