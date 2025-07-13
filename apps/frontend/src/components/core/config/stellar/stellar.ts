import * as StellarSDK from "@stellar/stellar-sdk";

// Horizon server – used for submitting transactions
export const horizonServer: StellarSDK.Horizon.Server =
  new StellarSDK.Horizon.Server(`${process.env.NEXT_PUBLIC_SERVER_URL}`, {
    allowHttp: true,
  });

// Soroban RPC server – used for contract simulation, preparation, and execution
export const sorobanServer: StellarSDK.SorobanRpc.Server =
  new StellarSDK.SorobanRpc.Server("https://soroban-testnet.stellar.org/", {
    allowHttp: true,
  });

// Certificate contract configuration – used during contract invocation
export const CERTIFICATE_WASM_HASH: string | undefined =
  process.env.NEXT_PUBLIC_WASM_HASH;

export const CERTIFICATE_CONTRACT_ID: string | undefined =
  process.env.NEXT_PUBLIC_CONTRACT_ID;
