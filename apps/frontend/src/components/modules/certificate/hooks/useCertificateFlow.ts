"use client"

import { useState } from "react"
import { issueCertificateOnChain } from "../services/certificate.service"
import { CertificateData, ContractCertificate } from "../types/certificates.types"

export const useCertificateFlow = () => {
  const [step, setStep] = useState(0)
  const [certId, setCertId] = useState<string>()
  const [contractCertificate, setContractCertificate] = useState<ContractCertificate>()
  const [signedAt, setSignedAt] = useState<string>()
  const [isSigned, setIsSigned] = useState<boolean>(false)
  const [certificateData, setCertificateData] = useState<CertificateData>()

  const startCertificateIssuance = async (data: CertificateData) => {
    const updatedMetadataHash = generateMetadataHash(data)
    const updatedData = {
      ...data,
      metadata: {
        ...data.metadata,
        certificateHash: updatedMetadataHash,
      },
    }
    const contractCert = await issueCertificateOnChain(updatedData)

    setCertId(updatedData.certificateId)
    setCertificateData(updatedData)
    setContractCertificate(contractCert)
    setStep(1)
  }

  const verifyCertificate = () => {
    if (!contractCertificate) return
    setContractCertificate({ ...contractCertificate, status: "issued" })
    setStep(2)
  }

  const signCertificate = () => {
    const now = new Date().toLocaleString("es-ES")
    const txId = "0x" + Math.random().toString(16).substr(2, 16)

    setIsSigned(true)
    setSignedAt(now)

    if (contractCertificate) {
      setContractCertificate({ ...contractCertificate, status: "verified" })
    }

    if (certificateData) {
      setCertificateData({
        ...certificateData,
        metadata: {
          ...certificateData.metadata,
          blockchainTxId: txId,
        },
      })
    }

    setStep(3)
  }

  return {
    step,
    certId,
    contractCertificate,
    certificateData,
    signedAt,
    isSigned,
    startCertificateIssuance,
    verifyCertificate,
    signCertificate,
  }
}

const generateMetadataHash = (data: CertificateData): string => {
  const metadataString = JSON.stringify({
    certificateId: data.certificateId,
    certificateType: data.certificateType,
    issueDate: data.issueDate,
    issuerAddress: data.issuerAddress,
    to: data.metadata.to,
    action: data.metadata.action,
  })
  return "0x" + btoa(metadataString).slice(0, 32) + "..." + btoa(metadataString).slice(-8)
}
