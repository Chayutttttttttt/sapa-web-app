export function formatDate(input) {
  if (!input) return "";
  const date = input.toDate ? input.toDate() : input;
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear() + 543;
  return `${d}/${m}/${y}`;
}