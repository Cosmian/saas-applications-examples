import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Decrypt data in KMS
//
export const decryptDataInKms = async (encryptText: Uint8Array, kmsToken: string, decryptionKeyID: string): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const decryptedData = await client.coverCryptDecrypt(decryptionKeyID, encryptText);
  return new TextDecoder().decode(decryptedData.plaintext);
};
