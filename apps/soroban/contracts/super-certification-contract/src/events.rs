use crate::types::{CertificateStatus, CertificateType};
use soroban_sdk::{symbol_short, Address, Env, String, Symbol};

/// Event topics for the contract
pub struct EventTopics;

impl EventTopics {
    /// Certificate issued event topic
    pub const CERTIFICATE_ISSUED: Symbol = symbol_short!("CERT_ISS");
    /// Certificate revoked event topic
    pub const CERTIFICATE_REVOKED: Symbol = symbol_short!("CERT_REV");
    /// Certificate status changed event topic
    pub const STATUS_CHANGED: Symbol = symbol_short!("STATUS_C");
    /// Authority added event topic
    pub const AUTHORITY_ADDED: Symbol = symbol_short!("AUTH_ADD");
    /// Authority updated event topic
    pub const AUTHORITY_UPDATED: Symbol = symbol_short!("AUTH_UPD");
    /// Role granted event topic
    pub const ROLE_GRANTED: Symbol = symbol_short!("ROLE_GRT");
    /// Role revoked event topic
    pub const ROLE_REVOKED: Symbol = symbol_short!("ROLE_REV");
    /// Contract upgraded event topic
    pub const CONTRACT_UPGRADED: Symbol = symbol_short!("UPGRADED");
}

/// Event emitter for the contract
pub struct Events;

impl Events {
    /// Emit certificate issued event
    pub fn certificate_issued(
        env: &Env,
        cert_id: &String,
        owner: &Address,
        issuer: &Address,
        cert_type: &CertificateType,
    ) {
        env.events().publish(
            (EventTopics::CERTIFICATE_ISSUED, cert_id.clone()),
            (owner.clone(), issuer.clone(), cert_type.clone()),
        );
    }

    /// Emit certificate status changed event
    pub fn status_changed(
        env: &Env,
        cert_id: &String,
        old_status: &CertificateStatus,
        new_status: &CertificateStatus,
        changed_by: &Address,
    ) {
        env.events().publish(
            (EventTopics::STATUS_CHANGED, cert_id.clone()),
            (old_status.clone(), new_status.clone(), changed_by.clone()),
        );
    }

    /// Emit certificate revoked event
    pub fn emit_certificate_revoked(
        env: &Env,
        cert_id: &String,
        revoked_by: &Address,
        reason: &Option<String>,
    ) {
        env.events().publish(
            (EventTopics::CERTIFICATE_REVOKED, cert_id.clone()),
            (revoked_by.clone(), reason.clone()),
        );
    }

    /// Emit authority added event
    pub fn authority_added(env: &Env, authority: &Address, added_by: &Address) {
        env.events()
            .publish((EventTopics::AUTHORITY_ADDED,), (authority, added_by));
    }

    /// Emit authority updated event
    pub fn authority_updated(env: &Env, authority: &Address, updated_by: &Address) {
        env.events()
            .publish((EventTopics::AUTHORITY_UPDATED,), (authority, updated_by));
    }

    /// Emit role granted event
    pub fn role_granted(env: &Env, address: &Address, role: &Symbol, granted_by: &Address) {
        env.events()
            .publish((EventTopics::ROLE_GRANTED,), (address, role, granted_by));
    }

    /// Emit role revoked event
    pub fn role_revoked(env: &Env, address: &Address, role: &Symbol, revoked_by: &Address) {
        env.events()
            .publish((EventTopics::ROLE_REVOKED,), (address, role, revoked_by));
    }

    /// Emit contract upgraded event
    pub fn contract_upgraded(
        env: &Env,
        old_version: &u32,
        new_version: &u32,
        upgraded_by: &Address,
    ) {
        env.events().publish(
            (EventTopics::CONTRACT_UPGRADED,),
            (old_version, new_version, upgraded_by),
        );
    }
}

// Standalone event functions for direct use in the contract

/// Emit certificate issued event
pub fn emit_certificate_issued(
    env: &Env,
    cert_id: &String,
    owner: &Address,
    issuer: &Address,
    cert_type: &CertificateType,
) {
    Events::certificate_issued(env, cert_id, owner, issuer, cert_type);
}

/// Emit certificate status changed event
pub fn emit_status_changed(
    env: &Env,
    cert_id: &String,
    old_status: &CertificateStatus,
    new_status: &CertificateStatus,
    changed_by: &Address,
) {
    Events::status_changed(env, cert_id, old_status, new_status, changed_by);
}

/// Emit certificate revoked event
pub fn emit_certificate_revoked(
    env: &Env,
    cert_id: &String,
    revoked_by: &Address,
    reason: &Option<String>,
) {
    Events::emit_certificate_revoked(env, cert_id, revoked_by, reason);
}
