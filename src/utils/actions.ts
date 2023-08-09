import { CoverCrypt, KmsClient, Policy, PrivateKey } from "cloudproof_js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

//
// Test KMS version
//
export const getKmsVersion = async (kmsToken: string): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const version = await client.version();
  return version.text();
};

//
// Creating a Policy
//
export const createPolicy = async (axis: PolicyAxisItem[]): Promise<Policy> => {
  const { Policy, PolicyAxis } = await CoverCrypt();
  const policyAxis = axis.map((entry) => {
    return new PolicyAxis(Object.keys(entry)[0], Object.values(entry)[0], false);
  });
  const policy = new Policy(policyAxis, 100);
  return policy;
};

//
// Creating Keys
//
export const createKeys = async (kmsToken: string, policy: Policy, decryptionAccessPolicy: string): Promise<KeysID> => {
  // KMS Client
  const client = new KmsClient(BACKEND_URL, kmsToken);

  const masterKeys = await client.createCoverCryptMasterKeyPair(policy);
  const masterSecretKeyUID = masterKeys[0];
  const masterPublicKeyUID = masterKeys[1];
  const decryptionKeyUID = await client.createCoverCryptUserDecryptionKey(decryptionAccessPolicy, masterSecretKeyUID);

  return {
    masterSecretKeyUID,
    masterPublicKeyUID,
    decryptionKeyUID,
  };
};

export type EncryptedResult = { key: number; marketing: Uint8Array; hr: Uint8Array };

//
// retrieve Keys
//
export const retrieveDecryptionKey = async (kmsToken: string, udkID: string): Promise<PrivateKey> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const decryptionKey = await client.retrieveCoverCryptUserDecryptionKey(udkID);
  return decryptionKey;
};

export const retrieveKeys = async (kmsToken: string, keysId: KeysID): Promise<KeysBytes> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const masterPublicKeyBytes = (await client.retrieveCoverCryptPublicMasterKey(keysId.masterPublicKeyUID)).bytes();
  const masterSecretKeyBytes = (await client.retrieveCoverCryptSecretMasterKey(keysId.masterSecretKeyUID)).bytes();
  return {
    masterPublicKeyBytes,
    masterSecretKeyBytes,
  };
};

//
// Encrypt data
//
export const encryptDataLocally = async (
  publicKey: Uint8Array,
  policy: Policy,
  accessPolicy: string,
  dataToEncrypt: Uint8Array
): Promise<Uint8Array> => {
  const { CoverCryptHybridEncryption } = await CoverCrypt();
  const encryption = new CoverCryptHybridEncryption(policy, publicKey);
  return encryption.encrypt(accessPolicy, dataToEncrypt);
};

export const encryptDataInKms = async (clearData: string, kmsToken: string, accessPolicy: string, mpkID: string): Promise<Uint8Array> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const data = new TextEncoder().encode(clearData);
  const encryptedData = await client.coverCryptEncrypt(mpkID, accessPolicy, data);
  return encryptedData;
};

//
// Decrypt data
//
export const decryptDataLocally = async (encrypted: Uint8Array, decryptionKey: Uint8Array | PrivateKey): Promise<string> => {
  const { CoverCryptHybridDecryption } = await CoverCrypt();
  const decrypter = new CoverCryptHybridDecryption(decryptionKey);
  const decrypted = decrypter.decrypt(encrypted);
  return new TextDecoder().decode(decrypted.plaintext);
};

export const decryptDataInKms = async (encryptText: Uint8Array, kmsToken: string, mskID: string, accessPolicy: string): Promise<string> => {
  const client = new KmsClient(BACKEND_URL, kmsToken);
  const userKeyID = await client.createCoverCryptUserDecryptionKey(accessPolicy, mskID);
  const decrypted = await client.coverCryptDecrypt(userKeyID, encryptText);
  return new TextDecoder().decode(decrypted.plaintext);
};

//
// Types
//
export type KeysID = {
  masterPublicKeyUID: string;
  masterSecretKeyUID: string;
  decryptionKeyUID: string;
};

export type KeysBytes = {
  masterPublicKeyBytes: Uint8Array;
  masterSecretKeyBytes: Uint8Array;
};

export type PolicyAxisItem = {
  [key: string]: { name: string; isHybridized: boolean }[];
};
