import { CoverCrypt, Policy } from "cloudproof_js";

// const POLICY_AXIS: PolicyAxisItem[] = [
//   {
//     department: [
//       { name: "Marketing", isHybridized: false },
//       { name: "HR", isHybridized: false },
//     ],
//   },
//   {
//     country: [
//       { name: "France", isHybridized: false },
//       { name: "Spain", isHybridized: false },
//       { name: "Germany", isHybridized: false },
//     ],
//   },
// ];

//
// Creating a Policy
//

type PolicyAxisItem = {
  [key: string]: { name: string; isHybridized: boolean }[];
};

export const createPolicy = async (axis: PolicyAxisItem[]): Promise<Policy> => {
  const { Policy, PolicyAxis } = await CoverCrypt();
  const policyAxis = axis.map((entry) => {
    return new PolicyAxis(Object.keys(entry)[0], Object.values(entry)[0], false);
  });
  const policy = new Policy(policyAxis);
  return policy;
};
