import { Contract, SorobanRpc, xdr, nativeToScVal, scValToNative } from "@stellar/soroban-client";

const rpcUrl = "https://soroban-testnet.stellar.org";

export const rpc = new SorobanRpc.Server(rpcUrl, { allowHttp: true });

const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID || "";

const contract = new Contract(contractId);

export async function issueCertificate(
  id: string,
  owner: string,
  metadataHash: string
) {
  const args = [
    nativeToScVal(id, { type: "string" }),
    nativeToScVal(owner, { type: "address" }),
    nativeToScVal(metadataHash, { type: "string" }),
  ];
  const result = await rpc.call(contract, "issue_certificate", ...args);
  return scValToNative(result as xdr.ScVal);
}

export async function getCertificateDetails(id: string) {
  const args = [nativeToScVal(id, { type: "string" })];
  const result = await rpc.call(contract, "get_certificate_details", ...args);
  return scValToNative(result as xdr.ScVal);
}

export async function revokeCertificate(id: string) {
  const args = [nativeToScVal(id, { type: "string" })];
  const result = await rpc.call(contract, "revoke_certificate", ...args);
  return scValToNative(result as xdr.ScVal);
}
