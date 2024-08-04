export const searchWithSubstring = (
  arr: string[],
  substring: string
): string[] => {
  return arr.filter((item) => item.includes(substring));
};
