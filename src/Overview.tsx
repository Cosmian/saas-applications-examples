import { Flex, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import ClientSideEncryption from "./assets/client_side_encryption.drawio.svg";
import ClientSideDecryption from "./assets/client_side_decryption.drawio.svg";

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
        <Flex flexDirection={"row"} verticalAlign={"top"}>
            <Image
            boxSize="50%"
            maxWidth={450}
            alignSelf={"center"}
            objectFit="cover"
            src={ClientSideEncryption}
            alt="Employees database schema"
            my={6}
            />
            <div style={{width: "15px"}}></div>
            <Image
            boxSize="50%"
            maxWidth={450}
            alignSelf={"center"}
            objectFit="cover"
            src={ClientSideDecryption}
            alt="Employees database schema"
            my={6}
            />
        </Flex>

        <Heading as="h3" size="md" mt={4}>
          Client-side encryption
        </Heading>
        <Text>
          With client-side encryption, content is encrypted from the customer's browser or API connector before it is transmitted to the cloud
          application servers. The customer manages the encryption keys in its Key Management Service (KMS). This approach significantly reduces the attack surface, as the
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
          Using Cosmian's Key Management Service (Cosmian KMS) and Public Key Infrastructure (PKI), users can safely share their keys via the zero trust layer. <br />
          <Link color="orange.500" onClick={() => onTabChange(2)}>
            → key distribution with Cosmian KMS and PKI example
          </Link>
        </Text>

        <Heading as="h3" size="md" mt={4}>
          Search encrypted data
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


        <Heading as="h3" size="md" mt={4}>
          Compute on encrypted data
        </Heading>
        <Text>
          Another drawback of using application-level encryption is that it can be difficult to perform computations on encrypted data. However, 
          Cosmian provides solutions that combine Trusted Execution Environments (TEEs) and cryptography to overcome this challenge. These solutions:
          <ul style={{paddingLeft: 20}}>
            <li>Protect data at runtime by running the application layer in encrypted memory.</li>
            <li>Allow users to remotely verify that the hardware and software running in the zero-trust environment have not been compromised.</li>
          </ul>
          Cosmian solutions are transparent to the application layer software, so they do not require a rewrite and can be quickly and easily deployed.
          <br/>
          <Link color="orange.500" onClick={() => {}}>
            → ask us for a demo and details
          </Link>
        </Text>
      </Stack>
    </Flex>
  );
};

export default Overview;
