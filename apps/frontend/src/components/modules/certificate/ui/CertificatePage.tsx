"use client";

import { useRef, useState } from "react";
import { useWallet } from "@/components/auth/hooks/useWallet.hook";
import { useGlobalAuthenticationStore } from "@/components/auth/store/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { issueCertificateOnChain } from "@/components/modules/certificate/services/certificate.service";
import { useScroll } from "framer-motion";
import { CertificateCard } from "./CertificateCard";
import StarsBackground from "../../background/StarsBackground";

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
  const [certificate, setCertificate] = useState<
    ContractCertificate | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const issueCertificate = async () => {
    setError(null);
    if (!address) {
      console.warn("⚠️ Wallet not connected. Attempting to connect...");
      await handleConnect();
      return;
    }
    if (!form.owner || !form.metadataHash) {
      setError(
        "⚠️ You must complete all required fields (Owner and Metadata Hash)."
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
      const issued = await issueCertificateOnChain(params);
      setCertificate(issued);
      setForm({ certId: "", owner: "", metadataHash: "" });
    } catch (e: unknown) {
      console.error("❌ An error occurred while issuing the certificate:", e);
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof e.message === "string"
      ) {
        setError(`📛 ${e.message}`);
      } else {
        setError("📛 Unknown error while issuing the certificate.");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-x-hidden"
    >
      <StarsBackground />
      <div className="container mx-auto p-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-2 mr-4 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          {!address ? (
            <Button
              onClick={handleConnect}
              className="bg-gradient-to-r from-[#0066ff] to-[#7b4dff] hover:from-[#0052cc] hover:to-[#6b3dcc] text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Connect Wallet
            </Button>
          ) : (
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="border-2 border-[#0066ff] text-[#0066ff] hover:bg-[#0066ff] hover:text-white px-4 py-2 rounded-xl transition-all duration-300 bg-transparent"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          )}
        </div>
        <Card className="max-w-xl mx-auto text-white bg-gray-900/50 backdrop-blur-sm border-gray-700 rounded-2xl">
          <CardHeader>
            <CardTitle>Issue Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="certId" className="text-gray-300 mb-2">
                Certificate ID
              </Label>
              <Input
                id="certId"
                value={form.certId}
                onChange={(e) => handleChange("certId", e.target.value)}
                placeholder="e.g. CERT-001"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-[#0066ff]"
              />
            </div>
            <div>
              <Label htmlFor="owner" className="text-gray-300 mb-2">
                Owner Address *
              </Label>
              <Input
                id="owner"
                value={form.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="e.g. GC..."
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-[#0066ff]"
              />
            </div>
            <div>
              <Label htmlFor="metadataHash" className="text-gray-300 mb-2">
                Metadata Hash *
              </Label>
              <Input
                id="metadataHash"
                value={form.metadataHash}
                onChange={(e) => handleChange("metadataHash", e.target.value)}
                placeholder="e.g. certificate-abc-hash"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-[#0066ff]"
              />
            </div>
            <Button
              onClick={issueCertificate}
              className="w-full bg-gradient-to-r from-[#0066ff] to-[#7b4dff] hover:from-[#0052cc] hover:to-[#6b3dcc] text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Issue Certificate
            </Button>
            {error && (
              <p className="text-red-400 text-sm mt-2 font-medium">{error}</p>
            )}
          </CardContent>
        </Card>

        {certificate && (
          <div className="mt-8">
            <h2 className="text-center text-2xl font-bold mb-4 text-white">
              Issued Certificate
            </h2>
            <CertificateCard certificate={certificate} />
          </div>
        )}
      </div>
    </div>
  );
}
