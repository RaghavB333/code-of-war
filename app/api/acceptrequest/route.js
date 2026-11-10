// import connectDB from "@/lib/mongoose";
// import userModel from "@/models/user.model";
// const {validationResult} = require('express-validator');



// export async function POST(req, res) {
//     // Connect to the database
//     await connectDB();
  
  
//     const errors = validationResult(req);
//     if(!errors.isEmpty())
//     {
//       return new Response(
//           JSON.stringify({ errors: errors.array() }),
//           { status: 400 }
//         );
//     }
  
//     const body = await req.json();
  
//     const {senderEmail, receiverEmail} = body;
//     console.log(senderEmail,receiverEmail);

//     const receiver = await userModel.findOne({email: receiverEmail});
//     const sender = await userModel.findOne({email: senderEmail});

//     if(!receiver.friends.includes(sender._id)){
//       receiver.friends.push(sender._id);
//       await receiver.save();
//     }

//     if(!sender.friends.includes(receiver._id)){
//       sender.friends.push(receiver._id);
//       await sender.save();
//     }

//     await userModel.updateOne(
//         { email: receiverEmail },
//         {
//           $pull: {
//             notifications: { senderEmail: senderEmail },
//           },
//         }
//       );

//     return new Response(
//         JSON.stringify({message: "request accepted"}),
//         { status: 200 }
//       );
// }


import User from '@/models/user.model';
import { authUser } from "@/app/middlewares/auth.middleware";

export async function POST(req) {
  const { user, error } = await authUser(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const senderEmail = String(body.senderEmail || '').trim().toLowerCase();
  if (!senderEmail) return Response.json({ message: 'Sender email is required.' }, { status: 400 });

  const pending = (user.notifications || []).some(
    (n) => n.senderEmail === senderEmail && n.status === 'pending'
  );
  if (!pending) {
    return Response.json({ message: 'This request is no longer available.' }, { status: 404 });
  }

  const sender = await User.findOne({ email: senderEmail, accountStatus: 'active' }).select('_id username email');
  if (!sender) {
    await User.updateOne({ _id: user._id }, { $pull: { notifications: { senderEmail } } });
    return Response.json({ message: 'This player no longer exists.' }, { status: 404 });
  }

  await Promise.all([
    User.updateOne(
      { _id: user._id },
      { $addToSet: { friends: sender._id }, $pull: { notifications: { senderEmail } } }
    ),
    User.updateOne(
      { _id: sender._id },
      { $addToSet: { friends: user._id }, $pull: { notifications: { senderEmail: user.email } } }
    ),
  ]);

  return Response.json({
    message: 'Friend added.',
    friend: { _id: sender._id, username: sender.username, email: sender.email },
  });
}