import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Decrypt data in KMS
//
export const decryptDataInKms = async (encryptText: Uint8Array, kmsToken: string, mskID: string, accessPolicy: string): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const userKeyID = await client.createCoverCryptUserDecryptionKey(accessPolicy, mskID);
  const decrypted = await client.coverCryptDecrypt(userKeyID, encryptText);
  return new TextDecoder().decode(decrypted.plaintext);
};
