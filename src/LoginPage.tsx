import { Box, Button, Text } from "@chakra-ui/react";
import CosmianEncryption from "./assets/endtoend-encryption-img.webp";

type LoginPageProps = {
  loginWithRedirect: () => void;
};
const LoginPage: React.FC<LoginPageProps> = ({ loginWithRedirect }) => {
  return (
    <Box w="100%" h="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient="linear-gradient(to-br,#220c54,#300193)">
      <Box
        w="100%"
        h="100vh"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        backgroundImage={{ base: "none", lg: CosmianEncryption }}
        backgroundRepeat="no-repeat"
        backgroundPosition="bottom -50% right -10%"
        backgroundSize="70%"
      >
        <Box w={{ base: "100%", lg: "50%" }} display="flex" flexDir="column" alignItems="flex-start" gap={8} p={50}>
          <Text
            bgGradient="linear(to-r, #FF8C4A, #FE0534)"
            bgClip="text"
            fontSize="5xl"
            fontFamily={"Montserrat, Helvetica, Arial, sans-serif"}
            fontWeight={"bold"}
            lineHeight="1em"
          >
            Cosmian for SaaS Applications
          </Text>
          <Text fontSize="3xl" color="white" fontFamily={"Montserrat, Helvetica, Arial, sans-serif"} fontWeight="semibold">
            Architecture diagrams and developer code examples
          </Text>
          <Button onClick={loginWithRedirect}>Create an account or login with Auth0</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
