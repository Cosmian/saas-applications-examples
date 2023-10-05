
//
//
// Create Decryption Key
//
String accessPolicy() throws CloudproofException {
    return "(country::Germany) && (department::HR)";
}

KmsClient kmsClient = new KmsClient(kmsServerUrl, apiKey);
String userDecryptionKeyUniqueIdentifier = kmsClient.createCoverCryptUserDecryptionKey(
  accessPolicy(),
  privateMasterKeyUniqueIdentifier
);
