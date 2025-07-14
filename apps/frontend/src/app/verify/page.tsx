"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { useWallet } from "@/components/auth/hooks/useWallet.hook";
import { useGlobalAuthenticationStore } from "@/components/auth/store/data";
import { useVerifyCertificate } from "@/components/modules/certificate/hooks/useVerifyCertificate";
import { CERTIFICATE_CONTRACT_ID } from "@/components/core/config/stellar/stellar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function VerifyCertificatePage() {
  const { handleConnect, handleDisconnect } = useWallet();
  const address = useGlobalAuthenticationStore((state) => state.address);

  const [form, setForm] = useState({
    certId: "",
    metadataHash: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const { verify, loading, result, error } = useVerifyCertificate(
    CERTIFICATE_CONTRACT_ID || ""
  );

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerify = async () => {
    setLocalError(null);
    if (!form.certId || !form.metadataHash) {
      setLocalError("Debes ingresar Cert ID y Metadata Hash");
      return;
    }
    await verify(form.certId, form.metadataHash);
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
            <CardTitle>Verify Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="certId">Certificate ID *</Label>
              <Input
                id="certId"
                value={form.certId}
                onChange={(e) => handleChange("certId", e.target.value)}
                placeholder="Ej: CERT-001"
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
            <Button onClick={handleVerify} className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>

            {(localError || error) && (
              <p className="text-red-600 text-sm mt-2 font-medium">
                {localError || error}
              </p>
            )}

            {result !== null && (
              <Badge
                variant="outline"
                className={result ? "text-green-600" : "text-red-600"}
              >
                {result ? "VALID" : "INVALID"}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
