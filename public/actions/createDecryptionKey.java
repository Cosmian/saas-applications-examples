//
// Create Decryption Key
//
public static void createDecryptionKey(String kmsServerUrl, Optional<String> apiKey, String privateMasterKeyUniqueIdentifier) {
  KmsClient kmsClient = new KmsClient(kmsServerUrl, apiKey);
  String userDecryptionKeyUniqueIdentifier = kmsClient.createCoverCryptUserDecryptionKey(
    "(country::Germany) && (department::Marketing)",
    privateMasterKeyUniqueIdentifier
  );
}
