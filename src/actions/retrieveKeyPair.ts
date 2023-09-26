import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

//
// Retrieve Key Pair
//

type KeysId = {
  masterPublicKeyUId: string;
  masterSecretKeyUId: string;
};

type KeysBytes = {
  masterPublicKeyBytes: Uint8Array;
  masterSecretKeyBytes: Uint8Array;
};

export const retrieveKeyPair = async (kmsToken: string, keyPair: KeysId): Promise<KeysBytes> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const masterPublicKeyBytes = (await client.retrieveCoverCryptPublicMasterKey(keyPair.masterPublicKeyUId)).bytes();
  const masterSecretKeyBytes = (await client.retrieveCoverCryptSecretMasterKey(keyPair.masterSecretKeyUId)).bytes();
  return {
    masterPublicKeyBytes,
    masterSecretKeyBytes,
  };
};
