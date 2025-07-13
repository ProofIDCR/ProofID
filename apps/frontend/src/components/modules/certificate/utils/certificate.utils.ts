import * as StellarSDK from "@stellar/stellar-sdk"
import { CertificateData } from "../types/certificates.types"

export const parseCertificateAsset = (cert: CertificateData): StellarSDK.xdr.ScVal => {
  const scMap = new Map<string, StellarSDK.xdr.ScVal>()

  scMap.set("is_valid", StellarSDK.xdr.ScVal.scvBool(true))
  scMap.set("metadata_hash", StellarSDK.xdr.ScVal.scvString(cert.metadata.certificateHash))
  scMap.set("owner", StellarSDK.xdr.ScVal.scvAddress(
    StellarSDK.xdr.ScAddress.scAddressTypeAccount(
      StellarSDK.xdr.PublicKey.publicKeyTypeEd25519(
        StellarSDK.StrKey.decodeEd25519PublicKey(cert.metadata.to)
      )
    )
  ))

  return StellarSDK.xdr.ScVal.scvMap(
    Array.from(scMap.entries()).map(([key, value]) =>
      new StellarSDK.xdr.ScMapEntry({ key: StellarSDK.xdr.ScVal.scvSymbol(key), val: value })
    )
  )
}
