# StarProof Frontend

## Environment Variables

This app expects the Soroban contract ID to be supplied via `NEXT_PUBLIC_CONTRACT_ID`.
Create a `.env.local` file in this directory with the following contents:

```bash
NEXT_PUBLIC_CONTRACT_ID="<your_contract_id>"
```

The frontend uses `@stellar/soroban-client` to communicate with the contract on
the Stellar testnet.
