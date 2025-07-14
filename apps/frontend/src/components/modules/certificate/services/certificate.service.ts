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
 * Verifica un certificado en la blockchain usando el contrato Soroban actualizado
 */
export const verifyCertificateOnChain = async ({
  contractId,
  certId,
  metadataHash,
}: {
  contractId: string;
  certId: string;
  metadataHash: string;
}): Promise<boolean> => {
  const certIdVal = StellarSDK.nativeToScVal(certId, { type: "string" });
  const metadataHashVal = StellarSDK.nativeToScVal(metadataHash, {
    type: "string",
  });

  const contract = new StellarSDK.Contract(contractId);

  const tx = contract.call("verify_certificate", certIdVal, metadataHashVal);

  const simulation = await sorobanServer.simulateTransaction(tx, {
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const result = simulation.results?.[0].result;

  if (!result) {
    throw new Error("No result returned from contract simulation.");
  }

  return result.toBoolean();
};
