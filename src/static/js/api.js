export async function get_all_items() {
  const response = await fetch("/api/items");
  return response.json();
}

export async function create_ticket(ticket) {
  const response = await fetch("/api/tickets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
  return response.json();
}
