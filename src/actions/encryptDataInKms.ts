import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Encrypt data in KMS
//
export const encryptDataInKms = async (clearData: string, kmsToken: string, accessPolicy: string, mpkID: string): Promise<Uint8Array> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const data = new TextEncoder().encode(clearData);
  const encryptedData = await client.coverCryptEncrypt(mpkID, accessPolicy, data);
  return encryptedData;
};
