//
// Encrypt data in KMS
//
KmsClient kmsClient = new KmsClient(kmsServerUrl, apiKey);
byte[] ciphertext = kmsClient.coverCryptEncrypt(publicMasterKeyUniqueIdentifier, plaintext.getBytes(StandardCharsets.UTF_8), policy);
