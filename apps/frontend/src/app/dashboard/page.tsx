"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/auth/hooks/useWallet.hook"
import { useGlobalAuthenticationStore } from "@/components/auth/store/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, CheckCircle, FileText, Sparkles, Hash, Clock, Shield, Building, UserCheck } from "lucide-react"
import Link from "next/link"
import { issueCertificateOnChain } from "@/components/modules/certificate/services/certificate.service"
import { signTransaction } from "@stellar/freighter-api"
import { buildCertificateTransaction } from "@/components/lib/stellar"
import { sorobanServer } from "@/components/core/config/stellar/stellar"
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit"


interface CertificateMetadata {
  to: string // user_address
  action: string // X action
  expires: boolean
  expirationDate?: string
  certificateHash: string
  blockchainTxId?: string
}

interface CertificateData {
  // Metadatos del contrato (principales)
  metadata: CertificateMetadata

  // Información básica del certificado
  certificateId: string
  certificateType: string
  issueDate: string
  description: string

  // Información del emisor (Issued_by)
  issuerName: string
  issuerAddress: string // Blockchain address del emisor
  issuerContact: string
}

interface ContractCertificate {
  id: string
  owner: string // propietario
  metadataHash: string // hash de metadatos
  status: "pending" | "issued" | "verified" | "expired" // estado
  issuedBy: string // emisor
  timestamp: number
}

interface FlowState {
  step: number
  certId?: string
  certificateData?: CertificateData
  contractCertificate?: ContractCertificate
  signedAt?: string
  isSigned?: boolean
}

export default function CredentialDashboard() {
  const [activeTab, setActiveTab] = useState("issuer")
  const { handleConnect, handleDisconnect } = useWallet()
  const address = useGlobalAuthenticationStore((state) => state.address)
  const [certificateForm, setCertificateForm] = useState<CertificateData>({
    certificateId: "",
    certificateType: "",
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
    issuerName: "",
    issuerAddress: address || "",
    issuerContact: "",
    metadata: {
      to: "",
      action: "CERTIFICATE_ISSUANCE",
      expires: false,
      expirationDate: "",
      certificateHash: "",
    },
  })

  const [flow, setFlow] = useState<FlowState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("certFlow")
      return saved ? JSON.parse(saved) : { step: 0 }
    }
    return { step: 0 }
  })

  useEffect(() => {
    if (address) {
      setCertificateForm((prev) => ({
        ...prev,
        issuerAddress: address,
        metadata: { ...prev.metadata, to: prev.metadata.to || address },
      }))
    } else {
      setCertificateForm((prev) => ({ ...prev, issuerAddress: "" }))
    }
  }, [address])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("certFlow", JSON.stringify(flow))
    }
  }, [flow])

  // Simular hash de metadatos
  const generateMetadataHash = (data: CertificateData): string => {
    const metadataString = JSON.stringify({
      certificateId: data.certificateId,
      certificateType: data.certificateType,
      issueDate: data.issueDate,
      issuerAddress: data.issuerAddress,
      to: data.metadata.to,
      action: data.metadata.action,
    })
    // Simular hash SHA256
    return "0x" + btoa(metadataString).slice(0, 32) + "..." + btoa(metadataString).slice(-8)
  }


  const requestCertificate = async () => {
    const certId = certificateForm.certificateId || "CERT-" + Date.now()

    const updatedCertData = {
      ...certificateForm,
      issuerAddress: address,
      certificateId: certId,
      metadata: {
        ...certificateForm.metadata,
        to: certificateForm.metadata.to || address,
        certificateHash: generateMetadataHash(certificateForm),
      },
    }

    // Insertar certificado en el contrato
    let contractCert: ContractCertificate
    try {
      contractCert = await issueCertificateOnChain(updatedCertData)
    } catch (e) {
      console.error("Failed to issue certificate on chain", e)
      contractCert = {
        id: updatedCertData.certificateId,
        owner: updatedCertData.metadata.to,
        metadataHash: updatedCertData.metadata.certificateHash,
        issuedBy: updatedCertData.issuerAddress,
        timestamp: Date.now(),
        status: "pending",
      }
    }

    setFlow({
      step: 1,
      certId,
      certificateData: updatedCertData,
      contractCertificate: contractCert,
    })
  }

  const createCertificate = () => {
    // Actualizar estado del contrato
    setFlow((prev) => ({
      ...prev,
      step: 2,
      contractCertificate: prev.contractCertificate
        ? {
            ...prev.contractCertificate,
            status: "issued",
          }
        : undefined,
    }))
  }

  const signCertificate = async () => {
    const signedAt = new Date().toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    let txHash = ""
    try {
      if (address) {
        const account = await sorobanServer.getAccount(address)
        const tx = buildCertificateTransaction(account, [])
        const prepared = await sorobanServer.prepareTransaction(tx)
        const { signedTxXdr } = await signTransaction(prepared.toXDR(), {
          address,
          networkPassphrase: WalletNetwork.TESTNET,
        })
        txHash = signedTxXdr.slice(0, 32)
      }
    } catch (e) {
      console.error("Failed to sign certificate", e)
    }

    setFlow((prev) => ({
      ...prev,
      step: 3,
      isSigned: true,
      signedAt,
      contractCertificate: prev.contractCertificate
        ? {
            ...prev.contractCertificate,
            status: "verified",
          }
        : undefined,
      certificateData: prev.certificateData
        ? {
            ...prev.certificateData,
            metadata: {
              ...prev.certificateData.metadata,
              blockchainTxId: txHash,
            },
          }
        : undefined,
    }))
  }

  const receiveCertificate = () => setFlow((prev) => ({ ...prev, step: 4 }))
  const deliverCertificate = () => setFlow((prev) => ({ ...prev, step: 5 }))

  const handleFormChange = (field: keyof CertificateData, value: string) => {
    setCertificateForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleMetadataChange = (field: keyof CertificateMetadata, value: string | boolean) => {
    setCertificateForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }))
  }

  const isFormValid = () => {
    return (
      certificateForm.certificateType.trim() !== "" &&
      certificateForm.issuerName.trim() !== "" &&
      certificateForm.issuerAddress.trim() !== "" &&
      certificateForm.metadata.to.trim() !== "" &&
      certificateForm.metadata.action.trim() !== ""
    )
  }

  const IssuerView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <Building className="h-5 w-5 mr-2 text-purple-600" />
          Certificate Issuer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.step === 0 && (
          <div className="space-y-6">
            {/* Información del Emisor (Issued_by) */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Issuer Information (Issued_by)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issuerName">Organization/Company Name *</Label>
                  <Input
                    id="issuerName"
                    value={certificateForm.issuerName}
                    onChange={(e) => handleFormChange("issuerName", e.target.value)}
                    placeholder="e.g., Tech Corp, University, Government Agency"
                  />
                </div>
                <div>
                  <Label htmlFor="issuerAddress">Issuer Blockchain Address *</Label>
                  <Input
                    id="issuerAddress"
                    value={certificateForm.issuerAddress}
                    onChange={(e) => handleFormChange("issuerAddress", e.target.value)}
                    placeholder="0x..."
                    readOnly
                    disabled={!address}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="issuerContact">Contact Information</Label>
                  <Input
                    id="issuerContact"
                    value={certificateForm.issuerContact}
                    onChange={(e) => handleFormChange("issuerContact", e.target.value)}
                    placeholder="email@company.com or phone number"
                  />
                </div>
              </div>
            </div>

            {/* Metadatos del Contrato */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-4 flex items-center">
                <Hash className="h-4 w-4 mr-2" />
                Contract Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userAddress">Recipient Address (to) *</Label>
                  <Input
                    id="userAddress"
                    value={certificateForm.metadata.to}
                    onChange={(e) => handleMetadataChange("to", e.target.value)}
                    placeholder="0x... (connect wallet or enter manually)"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Contract Action *</Label>
                  <Select
                    value={certificateForm.metadata.action}
                    onValueChange={(value) => handleMetadataChange("action", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CERTIFICATE_ISSUANCE">Certificate Issuance</SelectItem>
                      <SelectItem value="CERTIFICATE_VERIFICATION">Certificate Verification</SelectItem>
                      <SelectItem value="CERTIFICATE_REVOCATION">Certificate Revocation</SelectItem>
                      <SelectItem value="CREDENTIAL_GRANT">Credential Grant</SelectItem>
                      <SelectItem value="LICENSE_ISSUANCE">License Issuance</SelectItem>
                      <SelectItem value="ACHIEVEMENT_AWARD">Achievement Award</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="expires"
                    checked={certificateForm.metadata.expires}
                    onCheckedChange={(checked) => handleMetadataChange("expires", checked)}
                  />
                  <Label htmlFor="expires">Certificate Expires?</Label>
                </div>
                {certificateForm.metadata.expires && (
                  <div>
                    <Label htmlFor="expirationDate">Expiration Date</Label>
                    <Input
                      id="expirationDate"
                      type="date"
                      value={certificateForm.metadata.expirationDate}
                      onChange={(e) => handleMetadataChange("expirationDate", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={requestCertificate}
              disabled={!isFormValid()}
              className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white"
            >
              Issue Certificate to Contract (issue_certificate)
            </Button>
          </div>
        )}

        {flow.step > 0 && flow.step < 5 && (
          <div className="space-y-4">
            <p className="text-gray-700">Processing certificate...</p>
            {flow.contractCertificate && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Contract Status:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">ID:</span> {flow.contractCertificate.id}
                  </p>
                  <p>
                    <span className="font-medium">Owner:</span> {flow.contractCertificate.owner}
                  </p>
                  <p>
                    <span className="font-medium">Metadata Hash:</span> {flow.contractCertificate.metadataHash}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <Badge
                      className="ml-2"
                      variant={flow.contractCertificate.status === "verified" ? "default" : "secondary"}
                    >
                      {flow.contractCertificate.status}
                    </Badge>
                  </p>
                  <p>
                    <span className="font-medium">Issued By:</span> {flow.contractCertificate.issuedBy}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {flow.step === 5 && (
          <p className="flex items-center text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-2" /> Certificate verified and registered on blockchain
          </p>
        )}
      </CardContent>
    </Card>
  )

  const StarProofView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
          StarProof Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-700">Certificate received from issuer</p>
            {flow.contractCertificate && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">Contract Details (get_certificate_details):</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">ID:</span> {flow.contractCertificate.id}
                  </p>
                  <p>
                    <span className="font-medium">Owner:</span> {flow.contractCertificate.owner}
                  </p>
                  <p>
                    <span className="font-medium">Hash:</span> {flow.contractCertificate.metadataHash}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {flow.contractCertificate.status}
                  </p>
                  <p>
                    <span className="font-medium">Issuer:</span> {flow.contractCertificate.issuedBy}
                  </p>
                </div>
              </div>
            )}
            <Button onClick={createCertificate}>Process on Blockchain</Button>
          </div>
        )}

        {flow.step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-700">Certificate {flow.certId} waiting for recipient signature</p>
            {flow.contractCertificate && (
              <Badge variant="outline" className="bg-yellow-50">
                Status: {flow.contractCertificate.status}
              </Badge>
            )}
          </div>
        )}

        {flow.step === 3 && <Button onClick={receiveCertificate}>Receive signed certificate</Button>}
        {flow.step === 4 && <Button onClick={deliverCertificate}>Deliver certificate</Button>}
        {flow.step === 5 && (
          <p className="flex items-center text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />
            Certificate delivered successfully
          </p>
        )}

        {flow.step === 0 && <p className="text-gray-700">Waiting for certificate issuance request</p>}
      </CardContent>
    </Card>
  )

  const RecipientView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <UserCheck className="h-5 w-5 mr-2 text-purple-600" />
          Certificate Recipient
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.step === 2 && flow.certId && flow.certificateData && (
          <div className="space-y-4">
            {/* Vista previa del certificado */}
            <div className="p-6 bg-gray-50 rounded-lg border">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">DIGITAL CERTIFICATE</h2>
                <p className="text-gray-600">{flow.certificateData.issuerName}</p>
                <Badge variant="outline" className="mt-2">
                  {flow.certificateData.certificateId}
                </Badge>
              </div>

              <Separator className="my-4" />

              {/* Información del Contrato */}
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Hash className="h-4 w-4 mr-2" />
                  Contract Information
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Recipient (to):</span> {flow.certificateData.metadata.to}
                  </p>
                  <p>
                    <span className="font-medium">Action:</span> {flow.certificateData.metadata.action}
                  </p>
                  <p>
                    <span className="font-medium">Metadata Hash:</span> {flow.certificateData.metadata.certificateHash}
                  </p>
                  <p>
                    <span className="font-medium">Issuer:</span> {flow.certificateData.issuerAddress}
                  </p>
                  {flow.certificateData.metadata.expires && (
                    <p className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="font-medium">Expires:</span> {flow.certificateData.metadata.expirationDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Certificate Details</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Type:</span> {flow.certificateData.certificateType}
                    </p>
                    <p>
                      <span className="font-medium">Issue Date:</span>{" "}
                      {new Date(flow.certificateData.issueDate).toLocaleDateString("en-US")}
                    </p>
                    {flow.certificateData.description && (
                      <p>
                        <span className="font-medium">Description:</span> {flow.certificateData.description}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Issuer Information</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Organization:</span> {flow.certificateData.issuerName}
                    </p>
                    <p>
                      <span className="font-medium">Blockchain Address:</span> {flow.certificateData.issuerAddress}
                    </p>
                    {flow.certificateData.issuerContact && (
                      <p>
                        <span className="font-medium">Contact:</span> {flow.certificateData.issuerContact}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={signCertificate}
              className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white"
            >
              Sign Certificate on Blockchain
            </Button>
          </div>
        )}

        {flow.step === 3 && flow.isSigned && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center text-green-600 font-medium mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              Certificate Signed Successfully!
            </div>
            <p className="text-sm text-gray-600">Signed on: {flow.signedAt}</p>
            {flow.certificateData?.metadata.blockchainTxId && (
              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Blockchain TX:</span> {flow.certificateData.metadata.blockchainTxId}
                </p>
              </div>
            )}
            <Badge className="bg-green-100 text-green-800 border-green-200 mt-2">Verified on Blockchain</Badge>
          </div>
        )}

        {(flow.step === 0 || flow.step === 1 || flow.step > 3) && <p className="text-gray-700">No pending actions</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-purple-50/20" />
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Landing
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                StarProof dApp
              </h1>
            </div>
          </div>
          {!address ? (
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg"
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="issuer"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Certificate Issuer
            </TabsTrigger>
            <TabsTrigger
              value="starproof"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              StarProof Protocol
            </TabsTrigger>
            <TabsTrigger
              value="recipient"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              Certificate Recipient
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issuer">
            <IssuerView />
          </TabsContent>

          <TabsContent value="starproof">
            <StarProofView />
          </TabsContent>

          <TabsContent value="recipient">
            <RecipientView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
