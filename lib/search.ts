export function escapeSearch(value: string) {
  const slash = String.fromCharCode(92);
  const special = new Set([
    ".",
    "*",
    "+",
    "?",
    "^",
    "$",
    "{",
    "}",
    "(",
    ")",
    "|",
    "[",
    "]",
    slash,
  ]);
  return [...value]
    .map((char) => (special.has(char) ? slash + char : char))
    .join("");
}
