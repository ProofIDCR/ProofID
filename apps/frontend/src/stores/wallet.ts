import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'

export type SupportedWallet = 'freighter' | 'xbull'

interface WalletState {
  connected: boolean
  walletType: SupportedWallet | null
  publicKey: string | null
  connectWallet: (wallet: SupportedWallet) => Promise<void>
  disconnectWallet: () => Promise<void>
}

const kit = new StellarWalletsKit({ network: 'futurenet' })

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      connected: false,
      walletType: null,
      publicKey: null,
      connectWallet: async (wallet: SupportedWallet) => {
        const { publicKey } = await kit.connect(wallet)
        set({ connected: true, walletType: wallet, publicKey })
      },
      disconnectWallet: async () => {
        await kit.disconnect()
        set({ connected: false, walletType: null, publicKey: null })
      },
    }),
    { name: 'wallet-store' }
  )
)
