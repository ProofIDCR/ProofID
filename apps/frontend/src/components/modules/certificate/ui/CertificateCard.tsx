import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractCertificate {
  id: string;
  owner: string;
  metadataHash: string;
  issuedBy: string;
  timestamp: number;
  status: "pending" | "issued" | "verified" | "expired";
}

interface CertificateCardProps {
  certificate: ContractCertificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const formattedTimestamp = new Date(
    certificate.timestamp * 1000
  ).toLocaleString();

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl shadow-lg",
        "bg-gradient-to-br from-[#0066ff]/20 to-[#7b4dff]/20 text-white border border-gray-700 backdrop-blur-sm", // Updated gradient and border
        "max-w-md mx-auto w-full"
      )}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        {/* Subtle background icon for visual flair */}
        <Award className="w-full h-full text-white" />
      </div>
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            <FileText className="w-6 h-6 text-[#7b4dff]" />{" "}
            {/* Icon color updated */}
            Certificate
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-white/10 text-white border-white/20 text-xs font-semibold px-2 py-1 rounded-full" // Adjusted badge style
          >
            {certificate.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-2 text-sm text-gray-200">
        {" "}
        {/* Text color adjusted */}
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-100">ID:</p>
          <p className="text-right break-all">{certificate.id}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-100">Owner:</p>
          <p className="text-right break-all">
            {certificate.owner.slice(0, 10)}...{certificate.owner.slice(-8)}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-100">Metadata Hash:</p>
          <p className="text-right break-all">
            {certificate.metadataHash.slice(0, 10)}...
            {certificate.metadataHash.slice(-8)}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-100">Issued By:</p>
          <p className="text-right break-all">
            {certificate.issuedBy.slice(0, 10)}...
            {certificate.issuedBy.slice(-8)}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-100">Issued On:</p>
          <p className="text-right">{formattedTimestamp}</p>
        </div>
      </CardContent>
    </Card>
  );
}
