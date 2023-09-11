import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Decrypt data in KMS
//
export const decryptDataInKms = async (encryptText: Uint8Array, kmsToken: string, decryptionKey: string): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const decrypted = await client.coverCryptDecrypt(decryptionKey, encryptText);
  return new TextDecoder().decode(decrypted.plaintext);
};
