import { KmsClient } from "cloudproof_js";
import { BACKEND_URL } from "./backendConfig";

export const grantAccess = async (kmsToken: string, uniqueIdentifier: string, bytes: Uint8Array): Promise<> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  await client.grantAccess(uniqueIdentifier, "*", )
};
