export interface CertificateMetadata {
    to: string // Recipient address
    action: string // Action executed in the contract (e.g. CERTIFICATE_ISSUANCE)
    expires: boolean
    expirationDate?: string
    certificateHash: string
    blockchainTxId?: string // Blockchain transaction ID
  }
  
  export interface CertificateData {
    // General certificate information
    certificateId: string
    certificateType: string
    issueDate: string
    description: string
  
    // Issuer data
    issuerName: string
    issuerAddress: string // Blockchain address
    issuerContact: string
  
    // Contract metadata
    metadata: CertificateMetadata
  }
  
  export interface ContractCertificate {
    id: string
    owner: string
    metadataHash: string
    status: "pending" | "issued" | "verified" | "expired"
    issuedBy: string
    timestamp: number
  }
  