"use client";

import { useState } from "react";
import { useWallet } from "@/components/auth/hooks/useWallet.hook";
import { useGlobalAuthenticationStore } from "@/components/auth/store/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

import {
  issueCertificateOnChain,
  getCertificateDetails,
  verifyCertificate,
} from "@/components/modules/certificate/services/certificate.service";

interface ContractCertificate {
  id: string;
  owner: string;
  metadataHash: string;
  issuedBy: string;
  timestamp: number;
  status: "pending" | "issued" | "verified" | "expired";
}

export default function CredentialDashboard() {
  const { handleConnect, handleDisconnect } = useWallet();
  const address = useGlobalAuthenticationStore((state) => state.address);

  const [form, setForm] = useState({
    certId: "",
    owner: "",
    metadataHash: "",
  });

  const [certificate, setCertificate] = useState<ContractCertificate>();
  const [error, setError] = useState<string | null>(null);

  const verifyOnChain = async () => {
    if (!certificate) return;

    try {
      const details = await getCertificateDetails(certificate.id);
      const isValid = await verifyCertificate(
        certificate.id,
        certificate.metadataHash
      );

      setCertificate({
        ...certificate,
        owner: details.owner,
        metadataHash: details.metadataHash,
        status: isValid ? "issued" : "expired",
      });
    } catch (e) {
      console.error("Verification error", e);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const issueCertificate = async () => {
    setError(null);

    if (!address) {
      console.warn("⚠️ Wallet no conectada. Intentando conectar...");
      await handleConnect();
      return;
    }

    if (!form.owner || !form.metadataHash) {
      setError(
        "⚠️ Debes ingresar todos los campos obligatorios (Owner y Metadata Hash)."
      );
      return;
    }

    const params = {
      certificateId: form.certId || `CERT-${Date.now()}`,
      issuerAddress: address,
      metadata: {
        to: form.owner,
        certificateHash: form.metadataHash,
      },
    };

    try {
      console.log("🚀 Enviando parámetros a issueCertificateOnChain:", params);
      const issued = await issueCertificateOnChain(params);
      console.log("✅ Certificado emitido correctamente:", issued);
      setCertificate(issued);
      setForm({ certId: "", owner: "", metadataHash: "" });
    } catch (e: unknown) {
      console.error("❌ Ocurrió un error al emitir el certificado:", e);
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string"
      ) {
        setError(`📛 ${e.message}`);
      } else {
        setError("📛 Error desconocido al emitir el certificado.");
      }
    }
  };

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
                placeholder="Ej: CERT-001"
              />
            </div>
            <div>
              <Label htmlFor="owner">Owner Address *</Label>
              <Input
                id="owner"
                value={form.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="Ej: GC..."
              />
            </div>
            <div>
              <Label htmlFor="metadataHash">Metadata Hash *</Label>
              <Input
                id="metadataHash"
                value={form.metadataHash}
                onChange={(e) => handleChange("metadataHash", e.target.value)}
                placeholder="Ej: certificado-abc-hash"
              />
            </div>
            <Button onClick={issueCertificate} className="w-full">
              Issue Certificate
            </Button>

            {error && (
              <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>
            )}

            {certificate && (
              <div className="space-y-1 text-sm mt-4">
                <p>
                  <span className="font-medium">ID:</span> {certificate.id}
                </p>
                <p>
                  <span className="font-medium">Owner:</span>{" "}
                  {certificate.owner}
                </p>
                <p>
                  <span className="font-medium">Metadata Hash:</span>{" "}
                  {certificate.metadataHash}
                </p>
                <Badge variant="outline" className="mt-2">
                  {certificate.status}
                </Badge>
                <Button onClick={verifyOnChain} size="sm" className="mt-2">
                  Verify Certificate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
