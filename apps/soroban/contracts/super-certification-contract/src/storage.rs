use crate::types::{CertificateDetails, CertificationAuthority};
use soroban_sdk::{symbol_short, Address, Env, Map, String, Symbol, Vec};

/// Storage keys for the contract
pub struct StorageKeys;

impl StorageKeys {
    /// Admin role storage key
    pub const ADMIN: Symbol = symbol_short!("ADMIN");
    /// Certificates map storage key
    pub const CERTIFICATES: Symbol = symbol_short!("CERTS");
    /// Certification authorities map storage key
    pub const AUTHORITIES: Symbol = symbol_short!("AUTH");
    /// Roles map storage key
    pub const ROLES: Symbol = symbol_short!("ROLES");
    /// Contract configuration storage key
    pub const CONFIG: Symbol = symbol_short!("CONFIG");
    /// Contract version storage key
    pub const VERSION: Symbol = symbol_short!("VER");
}

/// Storage helper functions
pub struct Storage;

impl Storage {
    /// Get the admin address
    pub fn get_admin(env: &Env) -> Address {
        env.storage().instance().get(&StorageKeys::ADMIN).unwrap()
    }

    /// Set the admin address
    pub fn set_admin(env: &Env, admin: &Address) {
        env.storage().instance().set(&StorageKeys::ADMIN, admin);
    }

    /// Check if admin is set
    pub fn has_admin(env: &Env) -> bool {
        env.storage().instance().has(&StorageKeys::ADMIN)
    }

    /// Get the certificates map
    pub fn get_certificates(env: &Env) -> Map<String, CertificateDetails> {
        env.storage()
            .instance()
            .get(&StorageKeys::CERTIFICATES)
            .unwrap()
    }

    /// Set the certificates map
    pub fn set_certificates(env: &Env, certificates: &Map<String, CertificateDetails>) {
        env.storage()
            .instance()
            .set(&StorageKeys::CERTIFICATES, certificates);
    }

    /// Initialize certificates map if not exists
    pub fn init_certificates(env: &Env) {
        if !env.storage().instance().has(&StorageKeys::CERTIFICATES) {
            let certificates: Map<String, CertificateDetails> = Map::new(env);
            env.storage()
                .instance()
                .set(&StorageKeys::CERTIFICATES, &certificates);
        }
    }

    /// Get the authorities map
    pub fn get_authorities(env: &Env) -> Map<Address, CertificationAuthority> {
        env.storage()
            .instance()
            .get(&StorageKeys::AUTHORITIES)
            .unwrap()
    }

    /// Set the authorities map
    pub fn set_authorities(env: &Env, authorities: &Map<Address, CertificationAuthority>) {
        env.storage()
            .instance()
            .set(&StorageKeys::AUTHORITIES, authorities);
    }

    /// Initialize authorities map if not exists
    pub fn init_authorities(env: &Env) {
        if !env.storage().instance().has(&StorageKeys::AUTHORITIES) {
            let authorities: Map<Address, CertificationAuthority> = Map::new(env);
            env.storage()
                .instance()
                .set(&StorageKeys::AUTHORITIES, &authorities);
        }
    }

    /// Get the roles map
    pub fn get_roles(env: &Env) -> Map<Address, Vec<Symbol>> {
        env.storage().instance().get(&StorageKeys::ROLES).unwrap()
    }

    /// Set the roles map
    pub fn set_roles(env: &Env, roles: &Map<Address, Vec<Symbol>>) {
        env.storage().instance().set(&StorageKeys::ROLES, roles);
    }

    /// Initialize roles map if not exists
    pub fn init_roles(env: &Env) {
        if !env.storage().instance().has(&StorageKeys::ROLES) {
            let roles: Map<Address, Vec<Symbol>> = Map::new(env);
            env.storage().instance().set(&StorageKeys::ROLES, &roles);
        }
    }

    /// Initialize all storage
    pub fn init_all(env: &Env) {
        Self::init_certificates(env);
        Self::init_authorities(env);
        Self::init_roles(env);

        // Set contract version
        if !env.storage().instance().has(&StorageKeys::VERSION) {
            env.storage().instance().set(&StorageKeys::VERSION, &1u32);
        }
    }
}

// Standalone storage functions for direct use in the contract

/// Check if a certificate exists
pub fn has_certificate(env: &Env, cert_id: &String) -> bool {
    if !env.storage().instance().has(&StorageKeys::CERTIFICATES) {
        return false;
    }

    let certificates = Storage::get_certificates(env);
    certificates.contains_key(cert_id.clone())
}

/// Get a certificate by ID
pub fn get_certificate(env: &Env, cert_id: &String) -> CertificateDetails {
    let certificates = Storage::get_certificates(env);
    certificates.get(cert_id.clone()).unwrap()
}

/// Set a certificate
pub fn set_certificate(env: &Env, cert_id: &String, certificate: &CertificateDetails) {
    let mut certificates = Storage::get_certificates(env);
    certificates.set(cert_id.clone(), certificate.clone());
    Storage::set_certificates(env, &certificates);
}

/// Get all certificate IDs
pub fn get_all_certificate_ids(env: &Env) -> Vec<String> {
    if !env.storage().instance().has(&StorageKeys::CERTIFICATES) {
        return Vec::new(env);
    }

    let certificates = Storage::get_certificates(env);
    let mut cert_ids = Vec::new(env);

    for (id, _) in certificates.iter() {
        cert_ids.push_back(id);
    }

    cert_ids
}

/// Set the admin address (standalone function)
pub fn set_admin(env: &Env, admin: &Address) {
    Storage::set_admin(env, admin);
}

/// Check if admin is set (standalone function)
pub fn has_admin(env: &Env) -> bool {
    Storage::has_admin(env)
}
