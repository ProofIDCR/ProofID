import * as StellarSDK from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

import {
  buildCertificateInvokeOperation,
  buildCertificateTransaction,
  signAndSubmitCertificateTx,
} from "@/components/lib/stellar"

import { ContractCertificate } from "../types/certificates.types";
import { sorobanServer } from "@/components/core/config/stellar/stellar";

export interface IssueCertificateParams {
  certId: string
  owner: string
  metadataHash: string
  issuerAddress: string
}

export const issueCertificateOnChain = async (
  params: IssueCertificateParams
): Promise<ContractCertificate> => {
  const wasmHash = process.env.NEXT_PUBLIC_WASM_HASH;
  const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID;

  if (!wasmHash || !contractId) {
    throw new Error("Missing environment variables: WASM_HASH or CONTRACT_ID");
  }

  const account = await sorobanServer.getAccount(params.issuerAddress);

  const certIdVal = StellarSDK.nativeToScVal(params.certId, { type: "string" });
  const ownerVal = new StellarSDK.Address(params.owner).toScVal();
  const metadataHashVal = StellarSDK.nativeToScVal(params.metadataHash, {
    type: "string",
  });

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
    address: params.issuerAddress,
    networkPassphrase: WalletNetwork.TESTNET,
  });

  const signedTx = new StellarSDK.Transaction(
    signedTxXdr,
    WalletNetwork.TESTNET
  );

  // Send and wait for confirmation
  await signAndSubmitCertificateTx(signedTx, sorobanServer, undefined, false);

  return {
    id: params.certId,
    owner: params.owner,
    metadataHash: params.metadataHash,
    issuedBy: params.issuerAddress,
    timestamp: Date.now(),
    status: "pending",
  };
};
