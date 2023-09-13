import { CoverCrypt, Policy } from "cloudproof_js";
import { PolicyAxisItem } from "./types";

//
// Creating a Policy
//
export const createPolicy = async (axis: PolicyAxisItem[]): Promise<Policy> => {
  const { Policy, PolicyAxis } = await CoverCrypt();
  const policyAxis = axis.map((entry) => {
    return new PolicyAxis(Object.keys(entry)[0], Object.values(entry)[0], false);
  });
  const policy = new Policy(policyAxis, 100);
  return policy;
};
