export async function POST(req) {
  const { token } = await req.json();

  const res = await fetch(`http://43.204.216.76:2358/submissions/${token}`);
  const data = await res.json();
  return Response.json(data);
}
