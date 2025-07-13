"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWalletStore, SupportedWallet } from "@/stores/wallet"

export default function WalletConnector() {
  const { connected, walletType, connectWallet, disconnectWallet } = useWalletStore()
  const [selected, setSelected] = useState<SupportedWallet>('freighter')

  const handleConnect = async () => {
    await connectWallet(selected)
  }

  const handleDisconnect = async () => {
    await disconnectWallet()
  }

  if (connected) {
    return (
      <Button onClick={handleDisconnect} className="bg-red-600 text-white hover:bg-red-700">
        {`Desconectar ${walletType}`}
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selected} onValueChange={(v: SupportedWallet) => setSelected(v)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Wallet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="freighter">Freighter</SelectItem>
          <SelectItem value="xbull">xBull</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleConnect} className="bg-gradient-to-r from-black to-gray-800 text-white">
        Conectar Wallet
      </Button>
    </div>
  )
}
