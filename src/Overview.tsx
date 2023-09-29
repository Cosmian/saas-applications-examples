import { Flex, Heading, Image, Link, ListItem, Stack, Text, UnorderedList } from "@chakra-ui/react";
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
          This interface aims to show how Cosmian’s solutions can be implemented to add security on your current workflows - using
          client-side encryption:
        </Text>
        <UnorderedList>
          <ListItem>architecture of implementations</ListItem>
          <ListItem>code blocks to easily use Cosmian technologiesny</ListItem>
        </UnorderedList>
        <Text>
          With client-side encryption, content is encrypted in the customer's browser before the data is transmitted or stored on cloud or
          application services, using keys provided directly by the customer. This approach significantly minimizes the attack surface, as
          the application and data layers within the zero-trust environment process only encrypted data and have no access to decryption
          keys.{" "}
        </Text>
        <Image
          boxSize="100%"
          maxWidth={900}
          alignSelf={"center"}
          objectFit="cover"
          src={ArchitectureSchema}
          alt="Employees database schema"
          my={6}
        />

        <UnorderedList spacing={3}>
          <ListItem>
            To further enhance the security provided by application-level encryption, it is crucial to employ a robust encryption scheme
            like Covercrypt. Covercrypt mitigates the risks associated with key leakage from the presentation layer and addresses potential
            security risks such as rights escalation attacks and authorization misconfigurations. <br />
            <Link color="orange.500" onClick={() => onTabChange(1)}>
              → checkout Covercrypt with KMS example
            </Link>
          </ListItem>
          <ListItem>
            Using our KMS and its PKI, you can share safely keys between users <br />
            <Link color="orange.500" onClick={() => onTabChange(2)}>
              → checkout PKI example
            </Link>
          </ListItem>
          <ListItem>
            One of the first negative consequences of using application-level encryption is the inability of the storage layer to search for
            data, and most applications rely on search features for data extraction. This is because the search engine cannot decrypt the
            data and, therefore, cannot index it. To solve this issue <br />
            <Link color="orange.500" onClick={() => onTabChange(3)}>
              → checkout Findex example
            </Link>
          </ListItem>
        </UnorderedList>
      </Stack>
    </Flex>
  );
};

export default Overview;
