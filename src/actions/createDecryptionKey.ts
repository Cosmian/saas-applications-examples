import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Create Decryption Key
//
export const createDecryptionKey = async (
  kmsToken: string,
  masterSecretKeyUID: string,
  decryptionAccessPolicy: string,
  tags: string[] | undefined = undefined
): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);

  const decryptionKeyUID = await client.createCoverCryptUserDecryptionKey(decryptionAccessPolicy, masterSecretKeyUID, tags);
  return decryptionKeyUID;
};
