use crate::errors::Error;
use crate::events::Events;
use crate::storage::{Storage, StorageKeys};
use soroban_sdk::{symbol_short, Address, Env, Map, Symbol, Vec};

/// Role definitions
pub struct Roles;

impl Roles {
    /// Admin role with full access
    pub const ADMIN: Symbol = symbol_short!("ADMIN");
    /// Issuer role that can issue certificates
    pub const ISSUER: Symbol = symbol_short!("ISSUER");
    /// Verifier role that can verify certificates
    pub const VERIFIER: Symbol = symbol_short!("VERIFIER");
    /// Revoker role that can revoke certificates
    pub const REVOKER: Symbol = symbol_short!("REVOKER");
    /// Authority manager role that can manage certification authorities
    pub const AUTH_MANAGER: Symbol = symbol_short!("AUTH_MGR");
}

/// Access control helper functions
pub struct AccessControl;

impl AccessControl {
    /// Check if an address has a specific role
    pub fn has_role(env: &Env, address: &Address, role: &Symbol) -> bool {
        let roles = Storage::get_roles(env);

        if !roles.contains_key(address.clone()) {
            return false;
        }

        let address_roles = roles.get(address.clone()).unwrap();
        address_roles.contains(role)
    }

    /// Grant a role to an address
    pub fn grant_role(env: &Env, address: &Address, role: &Symbol) -> Result<(), Error> {
        // Only admin can grant roles
        let admin = Storage::get_admin(env);
        admin.require_auth();

        // Get the roles map
        let mut roles = Storage::get_roles(env);

        // Check if the address already has roles
        let mut address_roles: Vec<Symbol>;
        if roles.contains_key(address.clone()) {
            address_roles = roles.get(address.clone()).unwrap();

            // Check if the address already has the role
            if address_roles.contains(role) {
                return Ok(());
            }
        } else {
            address_roles = Vec::new(env);
        }

        // Add the role
        address_roles.push_back(role.clone());
        roles.set(address.clone(), address_roles);

        // Update the roles map
        Storage::set_roles(env, &roles);

        // Emit event
        Events::role_granted(env, address, role, &admin);

        Ok(())
    }

    /// Revoke a role from an address
    pub fn revoke_role(env: &Env, address: &Address, role: &Symbol) -> Result<(), Error> {
        // Only admin can revoke roles
        let admin = Storage::get_admin(env);
        admin.require_auth();

        // Get the roles map
        let mut roles = Storage::get_roles(env);

        // Check if the address has roles
        if !roles.contains_key(address.clone()) {
            return Ok(());
        }

        // Get the address roles
        let address_roles = roles.get(address.clone()).unwrap_or_else(|| Vec::new(env));

        // Find and remove the role
        let mut found = false;
        let mut new_roles = Vec::new(env);

        for r in address_roles.iter() {
            if r != *role {
                new_roles.push_back(r);
            } else {
                found = true;
            }
        }

        // If the role was found, update the roles
        if found {
            if new_roles.is_empty() {
                roles.remove(address.clone());
            } else {
                roles.set(address.clone(), new_roles);
            }

            // Update the roles map
            Storage::set_roles(env, &roles);

            // Emit event
            Events::role_revoked(env, address, role, &admin);
        }

        Ok(())
    }

    /// Check if the caller has a specific role
    pub fn require_role(env: &Env, role: &Symbol) -> Result<(), Error> {
        // Get the caller
        let auth = env.current_contract_address();

        // Check if the caller has the role
        if !Self::has_role(env, &auth, role) {
            return Err(Error::Unauthorized);
        }

        // Require authorization from the caller
        auth.require_auth();

        Ok(())
    }

    /// Check if the caller is an admin
    pub fn require_admin(env: &Env) -> Result<(), Error> {
        Self::require_role(env, &Roles::ADMIN)
    }

    /// Check if the caller is an issuer
    pub fn require_issuer(env: &Env) -> Result<(), Error> {
        // Admin can also issue
        if Self::has_role(env, &env.current_contract_address(), &Roles::ADMIN) {
            env.current_contract_address().require_auth();
            return Ok(());
        }

        Self::require_role(env, &Roles::ISSUER)
    }

    /// Check if the caller is a revoker
    pub fn require_revoker(env: &Env) -> Result<(), Error> {
        // Admin can also revoke
        if Self::has_role(env, &env.current_contract_address(), &Roles::ADMIN) {
            env.current_contract_address().require_auth();
            return Ok(());
        }

        Self::require_role(env, &Roles::REVOKER)
    }

    /// Check if the caller is an authority manager
    pub fn require_auth_manager(env: &Env) -> Result<(), Error> {
        // Admin can also manage authorities
        if Self::has_role(env, &env.current_contract_address(), &Roles::ADMIN) {
            env.current_contract_address().require_auth();
            return Ok(());
        }

        Self::require_role(env, &Roles::AUTH_MANAGER)
    }

    /// Get all roles for an address
    pub fn get_roles(env: &Env, address: &Address) -> Vec<Symbol> {
        let roles = Storage::get_roles(env);

        if !roles.contains_key(address.clone()) {
            return Vec::new(env);
        }

        roles.get(address.clone()).unwrap()
    }
}
