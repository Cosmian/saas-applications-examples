import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";
import { KeyPair, KeysBytes } from "./types";

//
// Retrieve Key Pair
//
export const retrieveKeyPair = async (kmsToken: string, keysId: KeyPair): Promise<KeysBytes> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const masterPublicKeyBytes = (await client.retrieveCoverCryptPublicMasterKey(keysId.masterPublicKeyUID)).bytes();
  const masterSecretKeyBytes = (await client.retrieveCoverCryptSecretMasterKey(keysId.masterSecretKeyUID)).bytes();
  return {
    masterPublicKeyBytes,
    masterSecretKeyBytes,
  };
};
