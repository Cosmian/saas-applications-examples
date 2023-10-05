//
// Decrypt data in KMS
//
KmsClient kmsClient = new KmsClient(kmsServerUrl, apiKey);
String plaintext = new String(
    kmsClient.coverCryptDecrypt(userDecryptionKey, ciphertext)
      .getPlaintext(),
  StandardCharsets.UTF_8);
