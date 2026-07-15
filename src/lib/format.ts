export function formatPrice(paisa: number): string {
  const rupees = paisa / 100;
  return `Rs. ${rupees.toLocaleString("en-PK")}`;
}
