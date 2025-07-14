# StarProof

> **Verifiable credentials on Stellar with dynamic on-chain and off-chain badges**

Prototype MVP that lets issuers mint Verifiable Credentials (VCs) and dynamic badges backed by the Stellar blockchain.  
_(The section **"Proposals to make StarProof more innovative"** is intentionally omitted for now)._ 

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [License](#license)

---

## Overview

**StarProof** simplifies the issuance and verification of digital credentials for education, communities, and employment.  
It combines Stellar’s low fees and fast settlement with W3C open standards to ensure authenticity and portability.

---

## Tech Stack

| Layer                         | Technologies                                          |
| ----------------------------- | ----------------------------------------------------- |
| **Blockchain / Settlement**   | Stellar (Mainnet & Testnet)                           |
| **Smart Contracts**           | Soroban (Rust + WASM)                                 |
| **Credential Format**         | W3C Verifiable Credentials (JSON-LD), OpenBadge 3.0   |
| **Identity & Authentication** | Stellar SEP-10, SEP-12, JWT                           |
| **Off-Chain API**             | Node.js (TypeScript) + Fastify, GraphQL               |
| **Storage**                   | IPFS for VC hashes, Amazon S3 for optional metadata   |
| **Frontend**                  | Next.js (React), Tailwind CSS, shadcn/ui, Stellar SDK |
| **DevOps**                    | Docker, GitHub Actions CI/CD, Fly.io                  |

---

## Features

- **VC-as-a-Service**: REST/GraphQL API to issue and verify credentials.
- **Dynamic Badges**: Badges that evolve based on on-chain activity.
- **SEP-10 Authentication**: Non-custodial login via signed challenge.
- **Low Fees**: Stellar transactions cost less than 0.00001 XLM.
- **W3C Compatibility**: Credentials exportable to any wallet supporting VC standards.

---

## Getting Started

```
Coming soon
```

---

## Project Structure

The repository is organized as a **monorepo**, grouping both applications and reusable packages:

- **apps/api**: the backend server using Fastify and GraphQL. Includes controllers for credential issuance and verification, SEP-10 authentication, business logic, and DB access.
- **apps/web**: the frontend application built with Next.js. Includes public pages, issuer dashboard, Stellar SDK integration, and styling with Tailwind and shadcn/ui.
- **packages/contracts**: smart contracts written in Rust for Soroban, compiled to WASM and deployed on Stellar.
- **packages/shared**: internal TypeScript library with shared types, crypto utilities, and functions used across both frontend and backend.
- **packages/docs**: auto-generated technical documentation such as OpenAPI schemas, GraphQL SDL, deployment guides, and architectural notes.
- Supporting folders like **.github/** (CI/CD workflows), **docker/** (dev containers), and **scripts/** (automation tasks) complete the project setup.

---

## License

MIT © 2025 StarProof
