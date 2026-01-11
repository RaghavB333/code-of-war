export async function POST(req) {
  const body = await req.json();

  const res = await fetch(`http://${process.env.Judge0_IP}/submissions?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return Response.json(data);
}
