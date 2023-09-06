export const cleanCode = (code: string): string => {
  const urlPattern = /("[^"]+"|'[^']+'|`[^`]+`)/g;
  const queryOptionPattern = /\?[^'"\s]+/g;
  let cleanCode = code.replace(urlPattern, (match) => {
    return match.replace(queryOptionPattern, "");
  });
  cleanCode = cleanCode.replace(/\/\/.*/g, "");
  return cleanEmptyParagraphs(cleanCode);
};

const cleanEmptyParagraphs = (inputString: string): string => {
  const lines = inputString.split("\n");
  // Remove empty paragraphs (blank lines) at the end of the string
  let lastIndex = lines.length - 1;
  while (lastIndex >= 0 && lines[lastIndex].trim() === "") {
    lastIndex--;
  }
  // Reconstruct the string without empty paragraphs
  const resultString = lines.slice(0, lastIndex + 1).join("\n");

  return resultString;
};
