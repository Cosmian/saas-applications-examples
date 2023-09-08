import { FetchChains, FetchEntries, Findex, FindexKey, Label } from "cloudproof_js";

export const searchWords = async (
  masterKey: FindexKey,
  label: Label,
  words: string[],
  fetchEntries: FetchEntries,
  fetchChains: FetchChains
) => {
  const { search } = await Findex();

  const results = await search(masterKey, label, words, fetchEntries, fetchChains);

  return results.locations();
};
