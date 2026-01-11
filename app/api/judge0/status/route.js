export async function POST(req) {
  const { token } = await req.json();

  const res = await fetch(
    `http://${process.env.Judge0_IP}/submissions/${token}?base64_encoded=false`
  );

  const data = await res.json();
  return Response.json(data);
}
