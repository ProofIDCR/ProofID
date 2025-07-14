export interface CertificateMetadata {
    to: string // Dirección del destinatario (usuario)
    action: string // Acción ejecutada en el contrato (e.g. CERTIFICATE_ISSUANCE)
    expires: boolean
    expirationDate?: string
    certificateHash: string
    blockchainTxId?: string // ID de la transacción en blockchain
  }
  
  export interface CertificateData {
    // Información general del certificado
    certificateId: string
    certificateType: string
    issueDate: string
    description: string
  
    // Datos del emisor
    issuerName: string
    issuerAddress: string // Dirección blockchain
    issuerContact: string
  
    // Metadatos de contrato
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
