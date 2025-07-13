"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  CheckCircle,
  Wallet,
  Key,
  FileText,
  Plus,
  Search,
  ArrowLeft,
  Clock,
  Award,
  AlertCircle,
  Sparkles,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { getWalletKit } from "@/lib/walletKit"

interface Credential {
  id: string
  issuer: string
  subject: string
  type: string
  metadata: {
    action: string
    timestamp: string
    expires: boolean
    expirationDate?: string
  }
  status: "valid" | "expired" | "revoked"
}

export default function CredentialDashboard() {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: "cred_001",
      issuer: "TW Platform",
      subject: "0x1234...5678",
      type: "ActionCredential",
      metadata: {
        action: "task_completed",
        timestamp: "2025-01-12T09:00:00Z",
        expires: true,
        expirationDate: "2025-08-01",
      },
      status: "valid",
    },
    {
      id: "cred_002",
      issuer: "Education Corp",
      subject: "0x1234...5678",
      type: "CertificationCredential",
      metadata: {
        action: "course_finished",
        timestamp: "2025-01-10T14:30:00Z",
        expires: true,
        expirationDate: "2026-01-10",
      },
      status: "valid",
    },
  ])

  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [issuanceForm, setIssuanceForm] = useState({
    userAddress: "",
    actionType: "",
  })
  const [verificationForm, setVerificationForm] = useState({
    credentialId: "",
  })

  const connectWallet = async () => {
    try {
      const kit = getWalletKit()
      const wallet = await kit.connect()
      if (wallet && wallet.publicKey) {
        setUserAddress(wallet.publicKey)
        setWalletConnected(true)
        toast.success(`Wallet connected successfully to ${wallet.publicKey}`)
      }
    } catch (e) {
      toast.error("Failed to connect wallet")
    }
  }

  const issueCredential = async () => {
    const newCredential: Credential = {
      id: `cred_${Date.now()}`,
      issuer: "StarProof Platform",
      subject: issuanceForm.userAddress,
      type: "ActionCredential",
      metadata: {
        action: issuanceForm.actionType,
        timestamp: new Date().toISOString(),
        expires: true,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      status: "valid",
    }

    setCredentials([...credentials, newCredential])
    setIssuanceForm({ userAddress: "", actionType: "" })
    setActiveTab("dashboard")

    toast.success(`Credential ${newCredential.id} issued successfully! 🎉`)
  }

  const verifyCredential = async () => {
    const credential = credentials.find((c) => c.id === verificationForm.credentialId)

    if (!credential) {
      toast.error("Credential not found. Please check the credential ID.")
      return
    }

    const isValid =
      credential.status === "valid" &&
      (!credential.metadata.expires || new Date(credential.metadata.expirationDate!) > new Date())

    if (isValid) {
      toast.success(
        `✅ Credential is valid! Issued by ${credential.issuer} • Valid until ${credential.metadata.expirationDate}`,
      )
    } else {
      toast.error("❌ Credential is invalid, expired, or revoked.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800 border-green-200"
      case "expired":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "revoked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "task_completed":
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      case "course_finished":
        return <Award className="w-4 h-4 text-purple-600" />
      case "certification_earned":
        return <Shield className="w-4 h-4 text-purple-600" />
      default:
        return <FileText className="w-4 h-4 text-purple-600" />
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Background Pattern - Same as landing */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-purple-50/20" />

      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
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
              <Star className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                StarProof dApp
              </h1>
            </div>
          </div>

          {/* Wallet Status */}
          {!walletConnected ? (
            <Button
              onClick={connectWallet}
              className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">{userAddress}</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="issue"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Issue
            </TabsTrigger>
            <TabsTrigger
              value="verify"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Verify
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Welcome Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent mb-2">
                      Welcome to StarProof
                    </h2>
                    <p className="text-gray-600">Manage your verifiable credentials securely</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-200 px-4 py-2 font-medium">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Stellar Powered
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent mb-2">
                    {credentials.length}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Total Credentials</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">
                    {credentials.filter((c) => c.status === "valid").length}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Valid Credentials</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 group">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-2">
                    {credentials.filter((c) => c.status !== "valid").length}
                  </div>
                  <div className="text-gray-600 text-sm font-medium">Expired</div>
                </CardContent>
              </Card>
            </div>

            {/* Credentials List */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Your Credentials
                </CardTitle>
                <CardDescription>All your verifiable credentials in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {credentials.map((credential) => (
                    <Card
                      key={credential.id}
                      className="border border-gray-200 hover:shadow-md transition-all duration-300 bg-white group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                              {getActionIcon(credential.metadata.action)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">{credential.id}</span>
                                <Badge className={getStatusColor(credential.status)}>{credential.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">{credential.issuer}</span> •{" "}
                                {credential.metadata.action.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">
                              {new Date(credential.metadata.timestamp).toLocaleDateString()}
                            </p>
                            {credential.metadata.expires && (
                              <p className="text-xs text-gray-500 flex items-center justify-end mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Expires: {credential.metadata.expirationDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issue Credential */}
          <TabsContent value="issue" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                  <Key className="h-5 w-5 mr-2 text-purple-600" />
                  Issue New Credential
                </CardTitle>
                <CardDescription>Create a new verifiable credential with cryptographic security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user-address" className="text-gray-700 font-medium">
                    User Address
                  </Label>
                  <Input
                    id="user-address"
                    placeholder="0x1234...5678 or stellar address"
                    value={issuanceForm.userAddress}
                    onChange={(e) => setIssuanceForm({ ...issuanceForm, userAddress: e.target.value })}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-type" className="text-gray-700 font-medium">
                    Action Type
                  </Label>
                  <Select
                    value={issuanceForm.actionType}
                    onValueChange={(value) => setIssuanceForm({ ...issuanceForm, actionType: value })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task_completed">Task Completed</SelectItem>
                      <SelectItem value="course_finished">Course Finished</SelectItem>
                      <SelectItem value="certification_earned">Certification Earned</SelectItem>
                      <SelectItem value="kyc_verified">KYC Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={issueCredential}
                  className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!issuanceForm.userAddress || !issuanceForm.actionType}
                  size="lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Credential
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Credential */}
          <TabsContent value="verify" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                  <Search className="h-5 w-5 mr-2 text-purple-600" />
                  Verify Credential
                </CardTitle>
                <CardDescription>Check the authenticity and validity of any credential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="credential-id" className="text-gray-700 font-medium">
                    Credential ID
                  </Label>
                  <Input
                    id="credential-id"
                    placeholder="cred_001"
                    value={verificationForm.credentialId}
                    onChange={(e) => setVerificationForm({ ...verificationForm, credentialId: e.target.value })}
                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <Button
                  onClick={verifyCredential}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!verificationForm.credentialId}
                  size="lg"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Credential
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
