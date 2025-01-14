import connectDB from "@/lib/mongoose";
import userModel from "@/models/user.model";
const {validationResult} = require('express-validator');



export async function POST(req, res) {
    // Connect to the database
    await connectDB();
  
  
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
      return new Response(
          JSON.stringify({ errors: errors.array() }),
          { status: 400 }
        );
    }
  
    const body = await req.json();
  
    const {email, friendemail} = body;
    
    const friend = await userModel.findOne({email: friendemail});

    console.log(friend);
    
        if(!friend)
        {
            return new Response(
                JSON.stringify({ message: "Friend not found"}),
                { status: 400 }
              );
        }

        const notification = {
            senderEmail:email,
            receiverEmail: friendemail,
            status: "panding",
            createdAt: new Date()
        }

        friend.notifications.push(notification);
        await friend.save();

        // const user = await userModel.findOne({email:email});
        // user.friends.push(friendemail);
        // await user.save();
    

    return new Response(
        JSON.stringify({ message: "Request Sends"}),
        { status: 201 }
      );
}

// router.post('/add-friend',[
//     body('friend_email').isEmail().withMessage('Invalid Email'),
//     body('email').isEmail().withMessage('Invalid Email'),

// ],
//     friendcontroller.addFriend
// );

// router.get('/friends', authMiddleware.authUser, friendcontroller.getFriends);