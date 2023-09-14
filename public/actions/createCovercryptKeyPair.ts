import { KmsClient, Policy } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";
import { KeysId } from "./types";

//
// Create Covercrypt Key Pair
//
export const createCovercryptKeyPair = async (
  kmsToken: string,
  policy: Policy,
  tags: string[] | undefined = undefined
): Promise<KeysId> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const [masterSecretKeyUID, masterPublicKeyUID] = await client.createCoverCryptMasterKeyPair(policy, tags);
  return {
    masterSecretKeyUID,
    masterPublicKeyUID,
  };
};
