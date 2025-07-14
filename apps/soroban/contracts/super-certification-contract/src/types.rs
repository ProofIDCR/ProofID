use soroban_sdk::{contracttype, Address, BytesN, Env, Map, String, Vec};

/// Certificate types supported by the contract
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum CertificateType {
    /// Standard certificate
    Standard = 0,
    /// Professional qualification
    Professional = 1,
    /// Academic degree
    Academic = 2,
    /// Technical certification
    Technical = 3,
    /// Membership certificate
    Membership = 4,
    /// Custom certificate type
    Custom = 5,
}

/// Certificate status
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum CertificateStatus {
    /// Certificate is active and valid
    Active = 0,
    /// Certificate has been revoked
    Revoked = 1,
    /// Certificate has expired
    Expired = 2,
    /// Certificate is temporarily suspended
    Suspended = 3,
}

/// Certification authority information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificationAuthority {
    /// Authority name
    pub name: String,
    /// Authority address
    pub address: Address,
    /// Authority verification key
    pub verification_key: BytesN<32>,
    /// Authority status (active or inactive)
    pub is_active: bool,
}

/// Certificate metadata
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificateMetadata {
    /// Certificate title
    pub title: String,
    /// Certificate description
    pub description: String,
    /// Certificate issue date (Unix timestamp)
    pub issue_date: u64,
    /// Certificate expiration date (Unix timestamp, 0 for no expiration)
    pub expiration_date: u64,
    /// Certificate type
    pub cert_type: CertificateType,
    /// Additional custom fields
    pub custom_fields: Map<String, String>,
}

/// Main certificate details structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificateDetails {
    /// Certificate recipient
    pub owner: Address,
    /// Certificate issuer (certification authority)
    pub issuer: Address,
    /// Cryptographic hash of the certificate metadata
    pub metadata_hash: String,
    /// Full certificate metadata
    pub metadata: CertificateMetadata,
    /// Certificate status
    pub status: CertificateStatus,
    /// Digital signature of the certificate
    pub signature: BytesN<64>,
    /// Certificate version
    pub version: u32,
    /// Revocation reason (if revoked)
    pub revocation_reason: Option<String>,
    /// Timestamp of last status change
    pub last_updated: u64,
}

/// Verification result with detailed information
//// #[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationResult {
    /// Whether the certificate exists
    pub exists: bool,
    /// Whether the certificate is valid (not revoked or expired)
    pub is_valid: bool,
    /// Whether the metadata hash matches
    pub hash_valid: bool,
    /// Whether the signature is valid
    pub signature_valid: bool,
    /// Certificate status
    pub status: Option<CertificateStatus>,
    /// Certificate owner
    pub owner: Option<Address>,
    /// Certificate issuer
    pub issuer: Option<Address>,
}
