import { KmsClient, KmsObject } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

export const saveObjectInPKI = async (
  kmsToken: string,
  uniqueIdentifier: string,
  kmsObject: KmsObject,
  unwrap: boolean
): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const uid = await client.importKey(uniqueIdentifier, kmsObject, unwrap, true);
  return uid;
};
