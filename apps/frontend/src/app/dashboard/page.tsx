"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Sparkles,
  Star,
} from "lucide-react"
import Link from "next/link"

interface CertificateData {
  studentName: string
  program: string
  date: string
  signed: boolean
}

interface FlowState {
  step: number
  certId?: string
  certificate?: CertificateData
}

export default function CredentialDashboard() {
  const [activeTab, setActiveTab] = useState("universidad")
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState("")
  const [certForm, setCertForm] = useState({
    studentName: "",
    program: "",
    date: "",
  })
  const [flow, setFlow] = useState<FlowState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("certFlow")
      return saved ? JSON.parse(saved) : { step: 0 }
    }
    return { step: 0 }
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("certFlow", JSON.stringify(flow))
    }
  }, [flow])

  const connectWallet = () => {
    const mockAddress =
      "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4)
    setUserAddress(mockAddress)
    setWalletConnected(true)
  }

  const requestCertificate = () =>
    setFlow({ step: 1, certificate: { ...certForm, signed: false } })
  const createCertificate = () =>
    setFlow((f) => ({ ...f, step: 2, certId: "cert_" + Date.now() }))
  const signCertificate = () =>
    setFlow((f) => ({ ...f, step: 3, certificate: { ...f.certificate!, signed: true } }))
  const receiveCertificate = () => setFlow((f) => ({ ...f, step: 4 }))
  const deliverCertificate = () => setFlow((f) => ({ ...f, step: 5 }))

  const UniversidadView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <FileText className="h-5 w-5 mr-2 text-purple-600" />Universidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.step === 0 && (
          <>
            <div className="space-y-2">
              <Label>Nombre del estudiante</Label>
              <Input
                value={certForm.studentName}
                onChange={(e) => setCertForm({ ...certForm, studentName: e.target.value })}
              />
              <Label>Programa</Label>
              <Input
                value={certForm.program}
                onChange={(e) => setCertForm({ ...certForm, program: e.target.value })}
              />
              <Label>Fecha de emisión</Label>
              <Input
                type="date"
                value={certForm.date}
                onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
              />
            </div>
            <Button onClick={requestCertificate}>Solicitar certificado</Button>
          </>
        )}
        {flow.step > 0 && (
          <div className="space-y-2">
            {flow.certificate && (
              <>
                <p>
                  <span className="font-medium">Estudiante:</span> {flow.certificate.studentName}
                </p>
                <p>
                  <span className="font-medium">Programa:</span> {flow.certificate.program}
                </p>
                <p>
                  <span className="font-medium">Fecha:</span> {flow.certificate.date}
                </p>
                {flow.certificate.signed && (
                  <p className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" /> Certificado firmado
                  </p>
                )}
              </>
            )}
            {flow.step < 5 && <p className="text-gray-700">Proceso en curso...</p>}
            {flow.step === 5 && (
              <p className="flex items-center text-green-600 font-medium">
                <CheckCircle className="w-4 h-4 mr-2" /> Certificado verificado
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const StarProofView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />StarProof
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.step === 0 && <p className="text-gray-700">Esperando solicitud de universidad</p>}
        {flow.step === 1 && (
          <div className="space-y-2">
            {flow.certificate && (
              <>
                <p className="text-sm text-gray-600">Estudiante: {flow.certificate.studentName}</p>
                <p className="text-sm text-gray-600">Programa: {flow.certificate.program}</p>
                <p className="text-sm text-gray-600">Fecha: {flow.certificate.date}</p>
              </>
            )}
            <Button onClick={createCertificate}>Crear certificado</Button>
          </div>
        )}
        {flow.step === 2 && (
          <div className="space-y-2">
            <p className="text-gray-700">Certificado {flow.certId} esperando firma del estudiante</p>
            {flow.certificate && (
              <>
                <p className="text-sm text-gray-600">Estudiante: {flow.certificate.studentName}</p>
                <p className="text-sm text-gray-600">Programa: {flow.certificate.program}</p>
                <p className="text-sm text-gray-600">Fecha: {flow.certificate.date}</p>
              </>
            )}
          </div>
        )}
        {flow.step === 3 && <Button onClick={receiveCertificate}>Recibir certificado firmado</Button>}
        {flow.step === 4 && <Button onClick={deliverCertificate}>Entregar certificado</Button>}
        {flow.step === 5 && (
          <p className="flex items-center text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-2" />Certificado entregado
          </p>
        )}
      </CardContent>
    </Card>
  )

  const EstudianteView = () => (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
          <Star className="h-5 w-5 mr-2 text-purple-600" />Estudiante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flow.certificate && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Estudiante: {flow.certificate.studentName}</p>
            <p className="text-sm text-gray-600">Programa: {flow.certificate.program}</p>
            <p className="text-sm text-gray-600">Fecha: {flow.certificate.date}</p>
          </div>
        )}
        {flow.step === 2 && flow.certId && (
          <Button onClick={signCertificate}>Firmar {flow.certId}</Button>
        )}
        {flow.step > 2 && flow.certificate?.signed && (
          <p className="flex items-center text-green-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-2" /> Certificado firmado
          </p>
        )}
        {flow.step < 2 && <p className="text-gray-700">Sin acciones pendientes</p>}
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
              <Button variant="outline" size="sm" className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />Back to Landing
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-purple-600 bg-clip-text text-transparent">
                StarProof dApp
              </h1>
            </div>
          </div>
          {!walletConnected ? (
            <Button onClick={connectWallet} className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white shadow-lg">
              Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border-2 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">{userAddress}</span>
            </div>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger value="universidad" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
              Universidad
            </TabsTrigger>
            <TabsTrigger value="starproof" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
              StarProof
            </TabsTrigger>
            <TabsTrigger value="estudiante" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
              Estudiante
            </TabsTrigger>
          </TabsList>
          <TabsContent value="universidad">
            <UniversidadView />
          </TabsContent>
          <TabsContent value="starproof">
            <StarProofView />
          </TabsContent>
          <TabsContent value="estudiante">
            <EstudianteView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
