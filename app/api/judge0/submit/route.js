export async function POST(req) {
  const body = await req.json();

  const res = await fetch("http://43.204.216.76:2358/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data);
}
