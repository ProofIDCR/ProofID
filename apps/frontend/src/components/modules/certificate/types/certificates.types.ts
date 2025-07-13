export interface CertificateData {
  certId: string
  owner: string
  metadataHash: string
}

export interface ContractCertificate {
  id: string
  owner: string
  metadataHash: string
  status: "pending" | "issued" | "verified" | "expired"
  issuedBy: string
  timestamp: number
}
  