# StarProof

> **Verifiable credentials for Web3 startups — with dynamic on-chain and off-chain badges**  
> Built on Stellar, ready for multichain.

---

## 🌟 What is StarProof?

**StarProof** is a credentials-as-a-service platform that allows startups to issue verifiable credentials and dynamic badges powered by smart contracts on Stellar.

We address a critical and growing problem in the digital world: **credential fraud and unverifiable claims.** In today’s landscape, many certificates, badges, and digital credentials can be easily falsified or manipulated. StarProof solves this by issuing cryptographically verifiable credentials on blockchain infrastructure.

---

## 🎯 Who is it for?

Our **initial target** is **Web3 startups** that need to issue trusted credentials for:

- Proof of escrow completion
- Crowdfunding participation records
- Grant delivery acknowledgements
- KYC/KYB certifications
- DAO membership or contributor badges

Almost every platform or community has **something to prove** — StarProof makes it verifiable.

---

## 🔍 Use Case Example

Imagine a startup running a **crowdfunding campaign**. Using StarProof, they can automatically issue a **grant receipt credential** to the recipient, which is:

- Cryptographically verifiable on-chain
- Associated with the wallet address of the recipient
- Shareable and portable across apps

This reduces fraud, builds trust, and enhances transparency for all parties involved.

---

## 🎥 Demo

📺 [Watch the demo on YouTube](https://www.youtube.com/watch?v=9jR_sRctyjI&ab_channel=SebasMena)

🧪 A functional prototype is already live on Vercel. Credential issuance is available via a guided multi-step process.

---

## 🧪 Tech Stack

| Layer                       | Technologies                                                         |
| --------------------------- | -------------------------------------------------------------------- |
| **Blockchain / Settlement** | Stellar (Testnet)                                                    |
| **Smart Contracts**         | Soroban (Rust + WASM)                                                |
| **Credential Format**       | W3C Verifiable Credentials (JSON-LD), OpenBadge 3.0                  |
| **Authentication**          | Wallet-based authentication (signed message flow)                    |
| **Off-Chain Support**       | Node.js (TypeScript), Firebase                                       |
| **Storage**                 | On-chain VC storage + DB cache for fast queries (non-sensitive data) |
| **Frontend**                | Next.js (React), Tailwind CSS, shadcn/ui, Stellar SDK                |
| **DevOps**                  | GitHub Actions CI/CD                                                 |

---

## ✨ Features

- **VC issuing module:** API to create and retrieve verifiable credentials (currently in development).
- **Dynamic Badges:** Badges that evolve based on on-chain activity.
- **Low Fees:** Stellar transactions cost less than 0.00001 XLM.
- _W3C compatibility is a future goal._

---

## 🚧 Roadmap (August 2025)

| Status      | Item                                                               |
| ----------- | ------------------------------------------------------------------ |
| 🟢 Done     | Initial POC + Demo deployed                                        |
| 🟡 In Prog. | Improve onboarding for contributors                                |
| 🟡 In Prog. | Make credential issuance easier (fewer steps)                      |
| 🔜 Next     | Test integrations with partners (GrantFox, KindFi, Trustless Work) |
| 🔜 Next     | Begin multichain experimentation (e.g., Starknet, Solana)          |

---

## 🛠 Getting Started

Coming soon

---

## 🤝 How to Contribute

We welcome contributions! Please check out our:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- [`ONBOARDING.md`](./ONBOARDING.md) — coming soon

---

## 📂 Project Structure

> ⚠️ **Note:** The current monorepo setup is temporary. We are migrating to separate repositories for the API and smart contracts to improve modularity.

- **apps/web**: the frontend application built with Next.js.
- **packages/contracts**: Soroban smart contracts written in Rust.
- **packages/shared**: internal TypeScript utilities used across the stack.
- **packages/docs**: OpenAPI, GraphQL SDL, deployment guides.
- Supporting folders like **.github/**, **docker/**, and **scripts/** complete the dev setup.

---

## 📄 License

MIT © 2025 StarProof
