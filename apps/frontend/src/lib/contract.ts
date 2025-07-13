import { Contract, Keypair, networks, SorobanRpc, TransactionBuilder } from "soroban-client";

const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = networks.TESTNET;
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID ?? "";
const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "";

export async function issueCertificate(owner: string, metadataHash: string) {
  if (!CONTRACT_ID || !ADMIN_SECRET) {
    console.warn("Contract ID or admin secret not configured");
    return;
  }

  const server = new SorobanRpc.Server(RPC_URL, { allowHttp: true });
  const admin = Keypair.fromSecret(ADMIN_SECRET);
  const account = await server.getAccount(admin.publicKey());
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call("issue_certificate", owner, metadataHash))
    .setTimeout(30)
    .build();

  tx.sign(admin);
  await server.sendTransaction(tx);
}
