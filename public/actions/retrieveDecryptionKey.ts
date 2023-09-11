import { KmsClient, PrivateKey } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Retrieve Decryption Key
//
export const retrieveDecryptionKey = async (kmsToken: string, udkID: string): Promise<PrivateKey> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const decryptionKey = await client.retrieveCoverCryptUserDecryptionKey(udkID);
  return decryptionKey;
};
