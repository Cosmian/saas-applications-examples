import { CoverCrypt, PrivateKey } from "cloudproof_js";

//
// Decrypt data locally
//
export const decryptDataLocally = async (encrypted: Uint8Array, decryptionKey: Uint8Array | PrivateKey): Promise<string> => {
  const { CoverCryptHybridDecryption } = await CoverCrypt();
  const decrypter = new CoverCryptHybridDecryption(decryptionKey);
  const decrypted = decrypter.decrypt(encrypted);
  return new TextDecoder().decode(decrypted.plaintext);
};
