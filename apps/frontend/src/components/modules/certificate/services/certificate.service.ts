import * as StellarSDK from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

import {
  buildCertificateInvokeOperation,
  buildCertificateTransaction,
} from "@/components/lib/stellar";

import {
  CertificateData,
  ContractCertificate,
} from "../types/certificates.types";
import { sorobanServer } from "@/components/core/config/stellar/stellar";

/**
 * Enviar transacción firmada por Freighter
 */
async function submitSignedTransactionXdr(
  signedXdr: string,
  networkPassphrase: string,
  server: StellarSDK.SorobanRpc.Server
) {
  const tx = StellarSDK.TransactionBuilder.fromXDR(
    signedXdr,
    networkPassphrase
  );
  return server.sendTransaction(tx);
}

/**
 * Emite un certificado en la blockchain usando el contrato Soroban actualizado
 */
export const issueCertificateOnChain = async (
  certData: CertificateData
): Promise<ContractCertificate> => {
  const wasmHash = process.env.NEXT_PUBLIC_WASM_HASH;
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  if (!wasmHash || !contractId) {
    throw new Error("Missing environment variables: WASM_HASH or CONTRACT_ID");
  }

  const account = await sorobanServer.getAccount(certData.issuerAddress);

  const certIdVal = StellarSDK.nativeToScVal(certData.certificateId, {
    type: "string",
  });

  const ownerVal = new StellarSDK.Address(certData.metadata.to).toScVal();

  const metadataHashVal = StellarSDK.nativeToScVal(
    certData.metadata.certificateHash,
    { type: "string" }
  );

  const operation = buildCertificateInvokeOperation(
    contractId,
    wasmHash,
    "issue_certificate",
    [certIdVal, ownerVal, metadataHashVal]
  );

  const transaction = buildCertificateTransaction(account, [operation]);

  const preparedTx = await sorobanServer.prepareTransaction(transaction);

  const { signedTxXdr } = await signTransaction(preparedTx.toXDR(), {
    address: certData.issuerAddress,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  await submitSignedTransactionXdr(
    signedTxXdr,
    WalletNetwork.TESTNET,
    sorobanServer
  );

  return {
    id: certData.certificateId,
    owner: certData.metadata.to,
    metadataHash: certData.metadata.certificateHash,
    issuedBy: certData.issuerAddress,
    timestamp: Date.now(),
    status: "pending",
  };
};

/**
 * Obtiene los detalles de un certificado almacenado en el contrato
 */
export const getCertificateDetails = async (
  certId: string
): Promise<{ owner: string; metadataHash: string; isValid: boolean }> => {
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  if (!contractId) {
    throw new Error("Missing environment variable: CONTRACT_ID");
  }

  const certIdVal = StellarSDK.nativeToScVal(certId, { type: "string" });

  const contract = new StellarSDK.Contract(contractId);
  const result = await contract.call({
    method: "get_certificate_details",
    args: [certIdVal],
    server: sorobanServer,
    networkPassphrase: StellarSDK.Networks.TESTNET,
  });

  const details = StellarSDK.scValToNative(result) as {
    owner: StellarSDK.Address;
    metadata_hash: string;
    is_valid: boolean;
  };

  return {
    owner: details.owner.toString(),
    metadataHash: details.metadata_hash,
    isValid: details.is_valid,
  };
};

/**
 * Verifica un certificado comparando su hash de metadatos
 */
export const verifyCertificate = async (
  certId: string,
  metadataHash: string
): Promise<boolean> => {
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  if (!contractId) {
    throw new Error("Missing environment variable: CONTRACT_ID");
  }

  const certIdVal = StellarSDK.nativeToScVal(certId, { type: "string" });
  const hashVal = StellarSDK.nativeToScVal(metadataHash, { type: "string" });

  const contract = new StellarSDK.Contract(contractId);
  const result = await contract.call({
    method: "verify_certificate",
    args: [certIdVal, hashVal],
    server: sorobanServer,
    networkPassphrase: StellarSDK.Networks.TESTNET,
  });

  return StellarSDK.scValToNative(result) as boolean;
};
