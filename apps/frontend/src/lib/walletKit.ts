import { WalletsKit, FreighterWallet } from "@creit.tech/stellar-wallets-kit"

let kit: WalletsKit | null = null

export const getWalletKit = () => {
  if (!kit) {
    kit = new WalletsKit({
      wallets: [new FreighterWallet()],
      network: "futurenet",
    })
  }
  return kit
}
