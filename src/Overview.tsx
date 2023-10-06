import { Flex, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import ArchitectureSchema from "./assets/architecture_schema.svg";

type OverviewProps = {
  onTabChange: (index: number) => void;
};
const Overview: React.FC<OverviewProps> = ({ onTabChange }) => {
  return (
    <Flex flexDirection={"column"}>
      <Stack spacing={3}>
        <Heading as="h2" size="lg" mb={4}>
          Overview
        </Heading>
        <Text>
          This interface demonstrates how Cosmian's solutions can be implemented to add <b>client-side encryption</b> to your current
          workflows.
        </Text>

        <Heading as="h3" size="md" mt={4}>
          Architecture of implementations
        </Heading>
        <Text>Cosmian provides code blocks that make using its technologies to implement client-side encryption easy.</Text>
        <Image
          boxSize="100%"
          maxWidth={900}
          alignSelf={"center"}
          objectFit="cover"
          src={ArchitectureSchema}
          alt="Employees database schema"
          my={6}
        />

        <Heading as="h3" size="md" mt={4}>
          Client-side encryption
        </Heading>
        <Text>
          With client-side encryption, content is encrypted in the customer's browser or connector before it is transmitted to the cloud
          application servers. The customer manages the encryption keys. This approach significantly reduces the attack surface, as the
          application and data layers within the zero-trust environment process only encrypted data and have no clear text access to the
          decryption keys.
        </Text>

        <Heading as="h3" size="md" mt={4}>
          State-of-the-art post-quantum encryption with embedded access policies
        </Heading>
        <Text>
          To further enhance the security provided by application-level encryption, employing a robust encryption scheme like Covercrypt is
          crucial. Covercrypt mitigates the risks associated with key leakage from the presentation layer and addresses potential security
          risks such as rights escalation attacks and authorization misconfigurations. <br />
          <Link color="orange.500" onClick={() => onTabChange(1)}>
            → attribute-based encryption example
          </Link>
        </Text>

        <Heading as="h3" size="md" mt={4}>
          Key distribution
        </Heading>
        <Text>
          Using Cosmian's Key Management Service (Cosmian KMS) and PKI, users can safely share their keys via the zero trust layer. <br />
          <Link color="orange.500" onClick={() => onTabChange(2)}>
            → key distribution with Cosmian KMS and PKI example
          </Link>
        </Text>

        <Heading as="h3" size="md" mt={4}>
          Search on encrypted data
        </Heading>
        <Text>
          One of the drawbacks of using application-level encryption is that the storage layer cannot search for data, and most applications
          rely on search features for data extraction. This is because the search engine cannot decrypt the data and, therefore, cannot
          index it. To solve this issue, Cosmian provides Findex, a searchable encryption scheme that allows the building of encrypted
          indexes. <br />
          <Link color="orange.500" onClick={() => onTabChange(3)}>
            → searchable encryption scheme example
          </Link>
        </Text>
      </Stack>
    </Flex>
  );
};

export default Overview;
