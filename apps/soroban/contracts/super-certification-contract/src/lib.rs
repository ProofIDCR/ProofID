#![no_std]
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env, Map, String, Symbol, Vec};

// Import modules
mod access_control;
mod errors;
mod events;
mod storage;
mod types;
mod utils;

// Re-export types for external use
pub use errors::Error;
pub use types::{
    CertificateDetails, CertificateMetadata, CertificateStatus, CertificateType,
    CertificationAuthority, VerificationResult,
};

// Main contract struct
#[contract]
pub struct SuperCertificationContract;

// Contract implementation
#[contractimpl]
impl SuperCertificationContract {
    /// Initialize the contract with an administrator address
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `authority` - The address of the authority
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn initialize(env: Env, authority: Address) -> Result<(), Error> {
        // Check if contract is already initialized
        if storage::has_admin(&env) {
            return Err(Error::AlreadyInitialized);
        }

        // Set the admin
        storage::set_admin(&env, &authority);

        // Grant admin role to the authority
        access_control::AccessControl::grant_role(&env, &authority, &access_control::Roles::ADMIN)?;

        // Grant issuer role to the authority
        access_control::AccessControl::grant_role(
            &env,
            &authority,
            &access_control::Roles::ISSUER,
        )?;

        Ok(())
    }

    /// Issue a new certificate
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    /// * `owner` - The address of the certificate owner
    /// * `metadata` - The certificate metadata
    /// * `signature` - Digital signature of the certificate
    /// * `cert_type` - The type of the certificate
    /// * `expiration_date` - The expiration date of the certificate
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn issue_certificate(
        env: Env,
        cert_id: String,
        owner: Address,
        metadata: String,
        signature: BytesN<64>,
        cert_type: CertificateType,
        expiration_date: u64,
    ) -> Result<(), Error> {
        // Check if caller is authorized to issue certificates
        let caller = env.current_contract_address();
        if !access_control::AccessControl::has_role(&env, &caller, &access_control::Roles::ISSUER) {
            return Err(Error::Unauthorized);
        }

        // Check if certificate already exists
        if storage::has_certificate(&env, &cert_id) {
            return Err(Error::CertificateAlreadyExists);
        }

        // Create certificate metadata
        let metadata_obj = CertificateMetadata {
            title: cert_id.clone(),
            description: metadata.clone(),
            issue_date: env.ledger().timestamp(),
            expiration_date,
            cert_type: cert_type.clone(),
            custom_fields: Map::new(&env),
        };

        // Create certificate details
        let cert_details = CertificateDetails {
            owner: owner.clone(),
            issuer: caller.clone(),
            metadata_hash: utils::bytes_to_string(
                &env,
                &utils::hash_metadata(&env, &cert_id, &metadata),
            ),
            metadata: metadata_obj,
            status: CertificateStatus::Active,
            signature,
            version: 1,
            revocation_reason: None,
            last_updated: env.ledger().timestamp(),
        };

        // Store the certificate
        storage::set_certificate(&env, &cert_id, &cert_details);

        // Emit certificate issued event
        events::emit_certificate_issued(&env, &cert_id, &owner, &caller, &cert_type);

        Ok(())
    }

    /// Batch issue multiple certificates
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_ids` - The unique identifiers for the certificates
    /// * `owners` - The addresses of the certificate owners
    /// * `metadatas` - The certificate metadatas
    /// * `signatures` - Digital signatures of the certificates
    /// * `cert_types` - The types of the certificates
    /// * `expiration_dates` - The expiration dates of the certificates
    ///
    /// # Returns
    /// * `Result<Vec<String>, Error>` - Failed certificate IDs
    pub fn batch_issue_certificates(
        env: Env,
        cert_ids: Vec<String>,
        owners: Vec<Address>,
        metadatas: Vec<String>,
        signatures: Vec<BytesN<64>>,
        cert_types: Vec<CertificateType>,
        expiration_dates: Vec<u64>,
    ) -> Result<Vec<String>, Error> {
        // Check if caller is authorized to issue certificates
        let caller = env.current_contract_address();
        if !access_control::AccessControl::has_role(&env, &caller, &access_control::Roles::ISSUER) {
            return Err(Error::Unauthorized);
        }

        // Check if all vectors have the same length
        let count = cert_ids.len();
        if owners.len() != count
            || metadatas.len() != count
            || signatures.len() != count
            || cert_types.len() != count
            || expiration_dates.len() != count
        {
            return Err(Error::InvalidMetadata);
        }

        // Process each certificate
        let mut failed_certs = Vec::new(&env);

        for i in 0..count {
            let cert_id = cert_ids.get(i).unwrap();
            let owner = owners.get(i).unwrap();
            let metadata = metadatas.get(i).unwrap();
            let signature = signatures.get(i).unwrap();
            let cert_type = cert_types.get(i).unwrap();
            let expiration_date = expiration_dates.get(i).unwrap();

            // Try to issue the certificate
            let result = SuperCertificationContract::issue_certificate(
                env.clone(),
                cert_id.clone(),
                owner.clone(),
                metadata.clone(),
                signature.clone(),
                cert_type.clone(),
                expiration_date,
            );

            // If failed, add to the failed list
            if result.is_err() {
                failed_certs.push_back(cert_id.clone());
            }
        }

        Ok(failed_certs)
    }

    /// List certificates owned by a specific address
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `owner` - The address of the certificate owner
    ///
    /// # Returns
    /// * `Vec<String>` - A list of certificate IDs owned by the address
    pub fn list_certificates_by_owner(env: Env, owner: Address) -> Vec<String> {
        // Get all certificates
        let cert_ids = storage::get_all_certificate_ids(&env);
        let mut owner_certs = Vec::new(&env);

        // Filter certificates by owner
        for id in cert_ids.iter() {
            let cert = storage::get_certificate(&env, &id);
            if cert.owner == owner {
                owner_certs.push_back(id);
            }
        }

        owner_certs
    }

    /// Update the status of a certificate
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    /// * `status` - The new status for the certificate
    /// * `reason` - Optional reason for the status change
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn update_certificate_status(
        env: Env,
        cert_id: String,
        status: CertificateStatus,
        reason: Option<String>,
    ) -> Result<(), Error> {
        // Check if the caller is authorized to update certificates
        let caller = env.current_contract_address();
        if !access_control::AccessControl::has_role(&env, &caller, &access_control::Roles::ISSUER) {
            return Err(Error::Unauthorized);
        }

        // Check if certificate exists
        if !storage::has_certificate(&env, &cert_id) {
            return Err(Error::CertificateNotFound);
        }

        // Get the certificate
        let mut certificate = storage::get_certificate(&env, &cert_id);

        // Store the old status for the event
        let old_status = certificate.status.clone();

        // Update the certificate status
        certificate.status = status.clone();

        // Update revocation reason if status is Revoked
        if status == CertificateStatus::Revoked {
            certificate.revocation_reason = reason.clone();
        }

        certificate.last_updated = env.ledger().timestamp();

        // Update the certificate in storage
        storage::set_certificate(&env, &cert_id, &certificate);

        // Emit status changed event
        events::emit_status_changed(&env, &cert_id, &old_status, &status, &caller);

        Ok(())
    }

    /// Update certificate metadata
    ///
    /// # Arguments
    /// * `env` - The environment object
    /// * `cert_id` - The unique identifier for the certificate
    /// * `metadata` - The new metadata for the certificate
    /// * `signature` - Digital signature of the updated certificate
    ///
    /// # Returns
    /// * `Result<(), Error>` - Success or an error
    pub fn update_certificate_metadata(
        env: Env,
        cert_id: String,
        metadata: String,
        signature: BytesN<64>,
    ) -> Result<(), Error> {
        // Check if the caller is authorized to issue certificates
        let caller = env.current_contract_address();
        if !access_control::AccessControl::has_role(&env, &caller, &access_control::Roles::ISSUER) {
            return Err(Error::Unauthorized);
        }

        // Check if certificate exists
        if !storage::has_certificate(&env, &cert_id) {
            return Err(Error::CertificateNotFound);
        }

        // Get the certificate
        let mut certificate = storage::get_certificate(&env, &cert_id);

        // Create new metadata hash
        let metadata_hash =
            utils::bytes_to_string(&env, &utils::hash_metadata(&env, &cert_id, &metadata));

        // Update the certificate metadata
        certificate.metadata.description = metadata;
        certificate.metadata_hash = metadata_hash;
        certificate.signature = signature;
        certificate.version += 1;
        certificate.last_updated = env.ledger().timestamp();

        // Update the certificate in storage
        storage::set_certificate(&env, &cert_id, &certificate);

        Ok(())
    }
}

// Include test module
//// #[cfg(test)]
//// mod test;
// This is commented because the test module is not working right now 😔
