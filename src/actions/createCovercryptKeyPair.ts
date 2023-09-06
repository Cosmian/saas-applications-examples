import { KmsClient, Policy } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";
import { KeyPair } from "./types";

//
// Create Covercrypt Key Pair
//
export const createCovercryptKeyPair = async (
  kmsToken: string,
  policy: Policy,
  tags: string[] | undefined = undefined
): Promise<KeyPair> => {
  // KMS Client
  const client = new KmsClient(BACKEND_URL, kmsToken);

  const masterKeys = await client.createCoverCryptMasterKeyPair(policy, tags);
  const masterSecretKeyUID = masterKeys[0];
  const masterPublicKeyUID = masterKeys[1];

  return {
    masterSecretKeyUID,
    masterPublicKeyUID,
  };
};
