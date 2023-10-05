//
// Encrypt data locally
//
byte[] ciphertext = CoverCrypt.encrypt(policy, masterKeys.getPublicKey(), encryptionPolicy, plaintext,
    Optional.of(uid), Optional.empty());
