import { Table, TableCaption, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { EncryptedResult } from "../actions/types";
import { Employee } from "../utils/employees";

export const EmployeeTable: React.FC<{ data: Employee[]; caption?: string }> = ({ data, caption }) => {
  const header = Object.keys(data[0]);
  return (
    <TableContainer maxWidth="100%">
      <Table variant="simple" width="100%">
        <Thead>
          <Tr>
            {header.map((key, index) => (
              <Th key={index}>{key}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => {
            return (
              <Tr key={index}>
                {Object.values(item).map((values, index) => (
                  <Td key={index}>{values}</Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
        {caption && <TableCaption>{caption}</TableCaption>}
      </Table>
    </TableContainer>
  );
};

export const EncryptedTable: React.FC<{ data: EncryptedResult[]; caption?: string; colorScheme?: string }> = ({
  data,
  caption,
  colorScheme,
}) => {
  const header = Object.keys(data[0]);
  return (
    <TableContainer>
      <Table variant="simple" width={"100%"} colorScheme={colorScheme ? colorScheme : "orange"}>
        <Thead>
          <Tr>
            {header.map((key, index) => (
              <Th key={index}>{key}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, index) => {
            return (
              <Tr key={index}>
                {Object.values(item).map((values, index) => (
                  <Td key={index} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: 400 }}>
                    {values}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
        {caption && <TableCaption>{caption}</TableCaption>}
      </Table>
    </TableContainer>
  );
};
