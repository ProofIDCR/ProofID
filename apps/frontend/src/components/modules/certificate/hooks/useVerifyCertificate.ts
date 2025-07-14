import { useState } from "react";
import { verifyCertificateOnChain } from "@/components/modules/certificate/services/certificate.service";

export function useVerifyCertificate(contractId: string) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async (certId: string, metadataHash: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const isValid = await verifyCertificateOnChain({
        contractId,
        certId,
        metadataHash,
      });
      setResult(isValid);
    } catch (e: unknown) {
      console.error("❌ Error verificando el certificado:", e);
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error desconocido al verificar el certificado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    verify,
    loading,
    result,
    error,
  };
}
