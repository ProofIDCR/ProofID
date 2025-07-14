use soroban_sdk::{contracterror, Symbol};

/// Error types for the SuperCertification contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Error when the caller is not authorized
    Unauthorized = 1,
    /// Error when a certificate already exists
    CertificateAlreadyExists = 2,
    /// Error when a certificate does not exist
    CertificateNotFound = 3,
    /// Error when the contract has already been initialized
    AlreadyInitialized = 4,
    /// Error when a certification authority already exists
    AuthorityAlreadyExists = 5,
    /// Error when a certification authority does not exist
    AuthorityNotFound = 6,
    /// Error when a certification authority is inactive
    AuthorityInactive = 7,
    /// Error when a certificate has expired
    CertificateExpired = 8,
    /// Error when a certificate has been revoked
    CertificateRevoked = 9,
    /// Error when a certificate is suspended
    CertificateSuspended = 10,
    /// Error when verification fails
    VerificationFailed = 11,
    /// Error when a signature is invalid
    InvalidSignature = 12,
    /// Error when metadata is invalid
    InvalidMetadata = 13,
    /// Error when a role already exists
    RoleAlreadyExists = 14,
    /// Error when a role does not exist
    RoleNotFound = 15,
    /// Error when a batch operation partially fails
    BatchOperationFailed = 16,
    /// Error when a certificate type is invalid
    InvalidCertificateType = 17,
    /// Error when a certificate status is invalid
    InvalidCertificateStatus = 18,
    /// Error when an operation is not supported
    OperationNotSupported = 19,
    /// Error when a parameter is invalid
    InvalidParameter = 20,
}
