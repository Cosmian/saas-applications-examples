import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";
import { KeysBytes, KeysId } from "./types";

//
// Retrieve Key Pair
//
export const retrieveKeyPair = async (kmsToken: string, keyPair: KeysId): Promise<KeysBytes> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const masterPublicKeyBytes = (await client.retrieveCoverCryptPublicMasterKey(keyPair.masterPublicKeyUID)).bytes();
  const masterSecretKeyBytes = (await client.retrieveCoverCryptSecretMasterKey(keyPair.masterSecretKeyUID)).bytes();
  return {
    masterPublicKeyBytes,
    masterSecretKeyBytes,
  };
};
