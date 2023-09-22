import { KmsClient, KmsObject } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

export const fetchWrappedKey = async (kmsToken: string, decryptionKeyUID: string, certificateUID: string): Promise<KmsObject> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const wrappedUserDecryptionKey = await client.getWrappedKey(decryptionKeyUID, certificateUID);
  return wrappedUserDecryptionKey;
};
