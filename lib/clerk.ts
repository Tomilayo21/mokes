// lib/clerk.ts
export async function fetchClerkUsers() {
  const res = await fetch('https://api.clerk.com/v1/users', {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.statusText}`);
  }

  const users = await res.json();
  return users;
}
