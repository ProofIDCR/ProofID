"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getCertificateDetails,
  verifyCertificate,
} from "@/components/modules/certificate/services/certificate.service";

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const [metadataHash, setMetadataHash] = useState("");
  const [result, setResult] = useState<{
    owner: string;
    metadataHash: string;
    valid: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError(null);
    setResult(null);

    if (!certId || !metadataHash) {
      setError("Certificate ID and metadata hash are required");
      return;
    }

    setLoading(true);
    try {
      const details = await getCertificateDetails(certId);
      const valid = await verifyCertificate(certId, metadataHash);
      setResult({ owner: details.owner, metadataHash: details.metadataHash, valid });
    } catch (e) {
      console.error("Verification failed", e);
      setError("Failed to verify certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-2 mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Verify Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                placeholder="Certificate ID"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Metadata Hash"
                value={metadataHash}
                onChange={(e) => setMetadataHash(e.target.value)}
              />
            </div>
            <Button onClick={handleVerify} disabled={loading} className="w-full">
              Verify
            </Button>
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
            {result && (
              <div className="space-y-1 text-sm mt-4">
                <p>
                  <span className="font-medium">Owner:</span> {result.owner}
                </p>
                <p>
                  <span className="font-medium">Metadata Hash:</span> {result.metadataHash}
                </p>
                <Badge variant="outline" className="mt-2">
                  {result.valid ? "valid" : "invalid"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
