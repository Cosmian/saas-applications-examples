//
// Create Covercrypt Key Pair
//
Policy policy = policy();
KmsClient kmsClient = new KmsClient(kmsServerUrl, apiKey);
String[] ids = kmsClient.createCoverCryptMasterKeyPair(policy);
