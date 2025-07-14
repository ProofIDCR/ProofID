import { randomBytes } from "crypto";
import * as StellarSDK from "@stellar/stellar-sdk";

/**
 * Builds a basic Stellar transaction from a list of Soroban operations.
 */
export function buildCertificateTransaction(
  account: StellarSDK.Account,
  operations: StellarSDK.xdr.Operation[],
  fee: string = StellarSDK.BASE_FEE,
  networkPassphrase: string = StellarSDK.Networks.TESTNET,
  timeout: number = 30
): StellarSDK.Transaction {
  const txBuilder = new StellarSDK.TransactionBuilder(account, {
    fee,
    networkPassphrase,
  }).setTimeout(timeout);

  operations.forEach((op) => txBuilder.addOperation(op));

  return txBuilder.build();
}

/**
 * Builds a Soroban host function operation to invoke a smart contract
 * for creating a certificate.
 *
 * @param contractAddress - Smart contract address
 * @param wasmHash - WASM hash of the deployed contract
 * @param entrypoint - Smart contract function to invoke (e.g. "create_certificate")
 * @param args - Arguments to the contract function as SCVals
 */
export function buildCertificateInvokeOperation(
  contractAddress: string,
  wasmHash: string,
  entrypoint: string,
  args: StellarSDK.xdr.ScVal[]
): StellarSDK.xdr.Operation {
  const wasmHashVal = StellarSDK.nativeToScVal(Buffer.from(wasmHash, "hex"), {
    type: "bytes",
  });

  const saltVal = StellarSDK.nativeToScVal(Buffer.from(randomBytes(32)), {
    type: "bytes",
  });

  const operation = StellarSDK.Operation.invokeHostFunction({
    auth: [],
    func: StellarSDK.xdr.HostFunction.hostFunctionTypeInvokeContract(
      new StellarSDK.xdr.InvokeContractArgs({
        contractAddress: new StellarSDK.Address(contractAddress).toScAddress(),
        functionName: entrypoint,
        args: args,
      })
    ),
  });

  return operation;
}

/**
 * Signs and submits a certificate-related Soroban transaction.
 * Waits for confirmation if needed.
 */
export async function signAndSubmitCertificateTx(
  transaction: StellarSDK.Transaction,
  keypair: StellarSDK.Keypair,
  server: StellarSDK.SorobanRpc.Server,
  shouldPrepare: boolean = true
): Promise<StellarSDK.rpc.Api.GetSuccessfulTransactionResponse> {
  let submission;

  if (shouldPrepare) {
    const preparedTx = await server.prepareTransaction(transaction);
    preparedTx.sign(keypair);
    submission = await server.sendTransaction(preparedTx);
  } else {
    transaction.sign(keypair);
    submission = await server.sendTransaction(transaction);
  }

  if (submission.status === "PENDING") {
    let txResponse: StellarSDK.rpc.Api.GetTransactionResponse;

    do {
      await new Promise((r) => setTimeout(r, 1000));
      txResponse = await server.getTransaction(submission.hash);
    } while (txResponse.status === "NOT_FOUND");

    if (txResponse.status === "SUCCESS") {
      return txResponse as StellarSDK.rpc.Api.GetSuccessfulTransactionResponse;
    } else {
      throw new Error(
        `Transaction failed on-chain: ${JSON.stringify(txResponse.resultXdr)}`
      );
    }
  } else {
    throw new Error(`Transaction failed to submit: ${submission.errorResult}`);
  }
}
