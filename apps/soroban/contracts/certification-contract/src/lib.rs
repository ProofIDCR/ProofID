#![no_std]
use soroban_sdk::contracttype;
use soroban_sdk::{
    contract, contracterror, contractimpl, symbol_short, Address, Env, Map, String, Symbol, Vec,
};

/// Define the contract data storage keys
const ADMIN: Symbol = symbol_short!("ADMIN");
const CERTIFICATES: Symbol = symbol_short!("CERTS");

/// Define the error types for the contract
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Error when the caller is not the admin
    Unauthorized = 1,
    /// Error when a certificate already exists
    CertificateAlreadyExists = 2,
    /// Error when a certificate does not exist
    CertificateNotFound = 3,
    /// Error when the contract has already been initialized
    AlreadyInitialized = 4,
}

/// Define the certificate details structure
/// The #[contracttype] attribute makes this type serializable for Soroban
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CertificateDetails {
    /// The owner of the certificate
    pub owner: Address,
    /// The hash of the certificate metadata
    pub metadata_hash: String,
    /// Whether the certificate is valid or revoked
    pub is_valid: bool,
}

/// The main contract struct
#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Initialize the contract with an administrator address
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `admin` - The address of the administrator
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        // Check if the contract is already initialized
        if env.storage().instance().has(&ADMIN) {
            return Err(Error::AlreadyInitialized);
        }

        // Store the admin address
        env.storage().instance().set(&ADMIN, &admin);

        // Initialize an empty certificates map
        let certificates: Map<String, CertificateDetails> = Map::new(&env);
        env.storage().instance().set(&CERTIFICATES, &certificates);

        Ok(())
    }

    /// Issue a new certificate
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    /// * `owner` - The address of the certificate owner
    /// * `metadata_hash` - The hash of the certificate metadata
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn issue_certificate(
        env: Env,
        cert_id: String,
        owner: Address,
        metadata_hash: String,
    ) -> Result<(), Error> {
        // Check if the caller is the admin
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();

        // Require authorization from admin
        admin.require_auth();

        // Get the certificates map
        let mut certificates: Map<String, CertificateDetails> =
            env.storage().instance().get(&CERTIFICATES).unwrap();

        // Check if the certificate already exists
        if certificates.contains_key(cert_id.clone()) {
            return Err(Error::CertificateAlreadyExists);
        }

        // Create the certificate details
        let certificate = CertificateDetails {
            owner,
            metadata_hash,
            is_valid: true,
        };

        // Add the certificate to the map
        certificates.set(cert_id, certificate);

        // Update the certificates map in storage
        env.storage().instance().set(&CERTIFICATES, &certificates);

        Ok(())
    }

    /// Revoke an existing certificate
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn revoke_certificate(env: Env, cert_id: String) -> Result<(), Error> {
        // Check if the caller is the admin
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();

        // Require authorization from admin
        admin.require_auth();

        // Get the certificates map
        let mut certificates: Map<String, CertificateDetails> =
            env.storage().instance().get(&CERTIFICATES).unwrap();

        // Check if the certificate exists
        if !certificates.contains_key(cert_id.clone()) {
            return Err(Error::CertificateNotFound);
        }

        // Get the certificate
        let mut certificate = certificates.get(cert_id.clone()).unwrap();

        // Update the certificate validity
        certificate.is_valid = false;

        // Update the certificate in the map
        certificates.set(cert_id, certificate);

        // Update the certificates map in storage
        env.storage().instance().set(&CERTIFICATES, &certificates);

        Ok(())
    }

    /// Get the details of a certificate
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    ///
    /// # Returns
    /// * `Result<CertificateDetails, Error>` - The certificate details or an error
    pub fn get_certificate_details(env: Env, cert_id: String) -> Result<CertificateDetails, Error> {
        // Get the certificates map
        let certificates: Map<String, CertificateDetails> =
            env.storage().instance().get(&CERTIFICATES).unwrap();

        // Check if the certificate exists
        if !certificates.contains_key(cert_id.clone()) {
            return Err(Error::CertificateNotFound);
        }

        // Return the certificate details
        Ok(certificates.get(cert_id).unwrap())
    }

    /// Verify a certificate by checking its existence and validity
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    /// * `metadata_hash` - The hash to verify against the stored metadata hash
    ///
    /// # Returns
    /// * `Result<bool, Error>` - True if valid, false if invalid or revoked, or an error
    pub fn verify_certificate(
        env: Env,
        cert_id: String,
        metadata_hash: String,
    ) -> Result<bool, Error> {
        // Get the certificate details
        let certificate = Self::get_certificate_details(env.clone(), cert_id)?;

        // Check if the certificate is valid and the metadata hash matches
        Ok(certificate.is_valid && certificate.metadata_hash == metadata_hash)
    }

    /// List all certificates (for admin use)
    ///
    /// # Arguments
    /// * `env` - The environment object
    ///
    /// # Returns
    /// * `Vec<String>` - A list of all certificate IDs
    pub fn list_certificates(env: Env) -> Vec<String> {
        // Check if the caller is the admin
        let admin: Address = env.storage().instance().get(&ADMIN).unwrap();

        // Require authorization from admin
        admin.require_auth();

        // Get the certificates map
        let certificates: Map<String, CertificateDetails> =
            env.storage().instance().get(&CERTIFICATES).unwrap();

        // Create a vector of certificate IDs
        let mut cert_ids = Vec::new(&env);
        for (id, _) in certificates.iter() {
            cert_ids.push_back(id);
        }

        cert_ids
    }
}

mod test;
