import { Flex, Heading, Image, ListItem, Stack, Text, UnorderedList } from "@chakra-ui/react";
import SetupFlow from "./assets/confidential_vm_setup_flow.drawio.svg";
import VerificationFlow from "./assets/confidential_vm_verification_flow.drawio.svg";

const ConfidentialVm: React.FC = () => {
  return (
    <Flex flexDirection={"column"}>
      <Stack spacing={3}>
        <Heading as="h2" size="lg" mb={4}>
          Confidential VM
        </Heading>
        <Text>
          Cosmian VM allows you to deploy an application on a cloud provider instance, running in a confidential context with verifiability
          at any time.
        </Text>
        <UnorderedList>
          <ListItem ml={8}>
            <b>No binary modification:</b> the application doesn’t need any third party library or any specific adaptation
          </ListItem>
          <ListItem ml={8}>
            <b>Simplicity is gold:</b> reduce at its maximum the number of manual actions the user has to do to spawn a Cosmian VM
          </ListItem>
          <ListItem ml={8}>
            <b>Confidentiality:</b> the application runs in a Trusted Execution Environment (encrypted memory)
          </ListItem>
          <ListItem ml={8}>
            <b>Verifiability:</b> a user is able to verify the integrity of the system (OS & application) at any time
          </ListItem>
        </UnorderedList>
        <Heading as="h3" size="md" mt={4}>
          Setup flow
        </Heading>
        <Text>
          A confidential VM is instanciated from a cloud provider platform, including Cosmian VM solution. After installing all
          dependencies, the VM is snapshotted and integrity checks can be performed on the running application, in order to verify the
          running code and infrastructure.
        </Text>
        <Image boxSize="100%" maxWidth={600} alignSelf={"center"} src={SetupFlow} alt="Confidential VM setup flow" my={6} />
        <Heading as="h3" size="md" mt={4}>
          Verification steps
        </Heading>
        <Text>Cosmian verification process is performed by the Admin sys, requesting on the running confidential VM, and checks:</Text>
        <UnorderedList>
          <ListItem ml={8}>IMA measurement list (containing the list of executed file's hash digest)</ListItem>
          <ListItem ml={8}>
            TEE (Trusted Execution Environment) elements to provide assurance that the code is running on secure and confidential hardware
          </ListItem>
          <ListItem ml={8}>TPM (Trusted Platform Module) elements to attest a TEE and the integrity of the system (IMA) </ListItem>
        </UnorderedList>
        <Image
          boxSize="100%"
          maxWidth={400}
          alignSelf={"center"}
          objectFit="cover"
          src={VerificationFlow}
          alt="Confidential VM verification flow"
          my={6}
        />
      </Stack>
    </Flex>
  );
};

export default ConfidentialVm;
