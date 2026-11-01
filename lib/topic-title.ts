/** Remove display-only numeric ordering prefixes without changing stored titles. */
export function displayTopicTitle(title: string): string {
  return title.replace(/^\s*\d{1,3}\s*(?:[.)\-:·]\s*)?/, "").trim();
}
