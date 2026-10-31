export async function POST(req) {
  const { token } = await req.json();
  // AWS Hosted Judge0 API endpoint http://43.204.216.76:2358/submissions/${token}
  const res = await fetch(`http://localhost:2358/submissions/${token}`);
  const data = await res.json();
  return Response.json(data);
}
