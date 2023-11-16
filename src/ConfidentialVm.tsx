import { AspectRatio, Button, Divider, Flex, Heading, Image, ListItem, Stack, Text, UnorderedList } from "@chakra-ui/react";
import { useState } from "react";
import Step1 from "./assets/confidential_vm/01-helloworld.png";
import Step2 from "./assets/confidential_vm/02-helloworld-hash.png";
import Step3 from "./assets/confidential_vm/03-hello-run.png";
import Step4 from "./assets/confidential_vm/04-agent-run.png";
import Step5 from "./assets/confidential_vm/05-snapshot.png";
import Step6 from "./assets/confidential_vm/06-snapshot-end.png";
import Step7 from "./assets/confidential_vm/07-search-in-snapshot.png";
import Step8 from "./assets/confidential_vm/08-verify.png";
import Step9 from "./assets/confidential_vm/09-add-malware.png";
import Step10 from "./assets/confidential_vm/10-verify-after-malware.png";

import { ArrowForwardIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import SetupFlow from "./assets/confidential_vm_setup_flow.drawio.svg";
import VerificationFlow from "./assets/confidential_vm_verification_flow.drawio.svg";

const ConfidentialVm: React.FC = () => {
  const [step, setStep] = useState<number>(1);
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
            <b>Simplicity is gold:</b> reduce at its minimum the number of manual actions the user has to do to spawn a Cosmian VM
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
        <Heading as="h3" size="md" mt={4}>
          Demonstration flow
        </Heading>
        <Heading as="h4" size="sm" mt={2}>
          Deploy the application and configure Cosmian VM
        </Heading>
        <Text>
          As a company running on a cloud provider, we would like to deploy an application (called <i>helloworld</i> here) on a confidential
          environment and we will use the product <b>Cosmian VM</b>. <br />
          In this example, the application has been released on github and its hash has been computed during the release flow.{" "}
        </Text>
        <Image boxSize="100%" maxWidth={1000} alignSelf={"center"} objectFit="cover" src={Step1} alt="step 1" my={2} />
        <Image boxSize="100%" maxWidth={1000} alignSelf={"center"} objectFit="cover" src={Step2} alt="step 2" my={2} />
        <Text>Once the VM instantiated, the administrator can start its application:</Text>
        <Button onClick={() => setStep(4)} width="100%" alignSelf={"center"}>
          Start the application
        </Button>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step3}
          alt="step 3"
          my={2}
          opacity={step < 4 ? 0.2 : 1}
        />
        <Text>
          On this same VM, an agent belonging to the <b>Cosmian VM</b> is also executed (as a linux service):
        </Text>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step4}
          alt="step 4"
          my={2}
          opacity={step < 4 ? 0.2 : 1}
        />
        <Divider />
        <Heading as="h4" size="sm" mt={2}>
          Snapshot the Cosmian VM
        </Heading>
        <Text>
          This agent can be queried from a CLI running on another standard machine. Once the <b>Cosmian VM</b> is set and completely
          configured, a snapshot is computed.
          <br />
          From now on, any modificiation on that VM is seen as malicious.{" "}
        </Text>
        <Button
          isDisabled={step < 4}
          onClick={async () => {
            setStep(5);
            await new Promise((r) => setTimeout(r, 2000));
            setStep(6);
          }}
          width="100%"
        >
          Snapshot the VM
        </Button>
        {step < 6 && (
          <Image
            boxSize="100%"
            maxWidth={800}
            alignSelf={"center"}
            objectFit="cover"
            src={Step5}
            alt="step 5"
            my={2}
            opacity={step < 5 ? 0.2 : 1}
          />
        )}
        {step > 5 && (
          <Image
            boxSize="100%"
            maxWidth={800}
            alignSelf={"center"}
            objectFit="cover"
            src={Step6}
            alt="step 6"
            my={2}
            opacity={step < 6 ? 0.2 : 1}
          />
        )}
        <Heading as="h4" size="sm" mt={2}>
          Audit the snapshot (optional)
        </Heading>
        <Text>Inside the snapshot, the administrator retrieves its application and its exact digest:</Text>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step7}
          alt="step 7"
          my={2}
          opacity={step < 6 ? 0.2 : 1}
        />
        <Divider />
        <Heading as="h4" size="sm" mt={2}>
          Verify the trustworthiness of the Cosmian VM
        </Heading>
        <Text>
          On a regular basis, the administrator can proceed with a verification of the <b>Cosmian VM</b> using the CLI and the previous
          computed snapshot.
          <br /> The integrity of the VM content is verified.
          <br />
          Also, the CLI checks that the VM is still a SEV AMD VM and checks the TPM used to attest the verification of the VM integrity.
        </Text>
        <Button
          onClick={() => setStep(8)}
          width="100%"
          isDisabled={step < 6}
          leftIcon={step < 8 ? <ArrowForwardIcon /> : <CheckCircleIcon />}
        >
          {step < 8 ? "Verify the VM integrity" : "Integrity checked"}
        </Button>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step8}
          alt="step 8"
          my={2}
          opacity={step < 8 ? 0.2 : 1}
        />
        <Divider />
        <Heading as="h4" size="sm" mt={2}>
          Detect malicious activities
        </Heading>
        <Text>
          Let’s say an attacker writes a malicious script and executes it on the <b>Cosmian VM</b>:
        </Text>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step9}
          alt="step 9"
          my={2}
          opacity={step < 8 ? 0.2 : 1}
        />
        <Button
          onClick={() => setStep(10)}
          width="100%"
          isDisabled={step < 8}
          leftIcon={step < 10 ? <ArrowForwardIcon /> : <WarningIcon />}
        >
          {step < 10 ? "Verify the VM integrity" : "Integrity check failed !"}
        </Button>
        <Image
          boxSize="100%"
          maxWidth={800}
          alignSelf={"center"}
          objectFit="cover"
          src={Step10}
          alt="step 10"
          my={2}
          opacity={step < 9 ? 0.2 : 1}
        />
        <Heading as="h3" size="md" mt={10}>
          Application example: confidential LLM chat
        </Heading>
        <Text>
          In this example we put an LLM model inside a <b>Cosmian VM</b> : the model and users queries are fully protected.
        </Text>
        <AspectRatio>
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/EDEtiXIylxc?si=yse2lQVGdPyKEGrl"
            title="Confidential llm"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </AspectRatio>
      </Stack>
    </Flex>
  );
};

export default ConfidentialVm;
