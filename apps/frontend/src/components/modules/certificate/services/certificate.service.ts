import * as StellarSDK from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

import {
  buildCertificateInvokeOperation,
  buildCertificateTransaction,
  signAndSubmitCertificateTx,
} from "@/components/lib/stellar"

import { CertificateData, ContractCertificate } from "../types/certificates.types";
import { sorobanServer } from "@/components/core/config/stellar/stellar";

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

  // Build transaction
  const transaction = buildCertificateTransaction(account, [operation]);

  // Prepare and sign
  const preparedTx = await sorobanServer.prepareTransaction(transaction);
  const { signedTxXdr } = await signTransaction(preparedTx.toXDR(), {
    address: certData.issuerAddress,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  // Send and wait for confirmation
  await signAndSubmitCertificateTx(
    preparedTx,
    StellarSDK.Keypair.fromPublicKey(certData.issuerAddress), // For type compatibility only
    sorobanServer,
    false // Already prepared, no need to re-prepare
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
