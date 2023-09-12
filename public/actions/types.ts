//
// Types
//
export type KeysId = {
  masterPublicKeyUID: string;
  masterSecretKeyUID: string;
};

export type KeysBytes = {
  masterPublicKeyBytes: Uint8Array;
  masterSecretKeyBytes: Uint8Array;
};

export type PolicyAxisItem = {
  [key: string]: { name: string; isHybridized: boolean }[];
};

export type EncryptedResult = { key: number; marketing: Uint8Array; hr: Uint8Array };
