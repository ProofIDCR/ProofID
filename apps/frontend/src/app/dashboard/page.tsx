"use client"

import { useState } from "react"
import { useWallet } from "@/components/auth/hooks/useWallet.hook"
import { useGlobalAuthenticationStore } from "@/components/auth/store/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, CheckCircle } from "lucide-react"
import {
  issueCertificateOnChain,
  IssueCertificateParams,
} from "@/components/modules/certificate/services/certificate.service"

interface ContractCertificate {
  id: string
  owner: string
  metadataHash: string
  issuedBy: string
  timestamp: number
  status: "pending" | "issued" | "verified" | "expired"
}

export default function CredentialDashboard() {
  const { handleConnect, handleDisconnect } = useWallet()
  const address = useGlobalAuthenticationStore((state) => state.address)
  const [form, setForm] = useState({ certId: "", owner: "", metadataHash: "" })
  const [certificate, setCertificate] = useState<ContractCertificate>()

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const issueCertificate = async () => {
    if (!address) {
      await handleConnect()
      return
    }

    const params: IssueCertificateParams = {
      certId: form.certId || `CERT-${Date.now()}`,
      owner: form.owner,
      metadataHash: form.metadataHash,
      issuerAddress: address,
    }

    try {
      const issued = await issueCertificateOnChain(params)
      setCertificate(issued)
    } catch (e) {
      console.error("Failed to issue certificate", e)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-2 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          {!address ? (
            <Button onClick={handleConnect}>Connect Wallet</Button>
          ) : (
            <Button onClick={handleDisconnect} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          )}
        </div>

        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Issue Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="certId">Certificate ID</Label>
              <Input
                id="certId"
                value={form.certId}
                onChange={(e) => handleChange("certId", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner Address</Label>
              <Input
                id="owner"
                value={form.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="metadataHash">Metadata Hash</Label>
              <Input
                id="metadataHash"
                value={form.metadataHash}
                onChange={(e) => handleChange("metadataHash", e.target.value)}
              />
            </div>
            <Button onClick={issueCertificate} className="w-full">
              Issue Certificate
            </Button>
            {certificate && (
              <div className="space-y-1 text-sm mt-4">
                <p>
                  <span className="font-medium">ID:</span> {certificate.id}
                </p>
                <p>
                  <span className="font-medium">Owner:</span> {certificate.owner}
                </p>
                <p>
                  <span className="font-medium">Metadata Hash:</span> {certificate.metadataHash}
                </p>
                <Badge variant="outline" className="mt-2">
                  {certificate.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

