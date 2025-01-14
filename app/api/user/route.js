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

  const {username,email,password,confirmPassword} = body;
  console.log(username,email,password,confirmPassword);

  const isuser = await userModel.findOne({email});

  if(isuser)
  {
    return new Response(
        JSON.stringify({ message: "User already exists" }),
        { status: 400 }
      );
  }

  if(password != confirmPassword)
  {
    return new Response(
        JSON.stringify({ message: "Passwords do not match" }),
        { status: 400 }
      );
  }

  const hashPassword = await userModel.hashPassword(password);
  console.log(hashPassword);

  const user = await userModel.create({
      username: username,
      email: email,
      password: hashPassword
  });

  const token = user.generateAuthToken();
  return new Response(
      JSON.stringify({ token,user }),
      { status: 201 }
    );

}



// router.post('/login',[
//     body('email').isEmail().withMessage('Invalid Email'),
//     body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long'),
// ],
//     usercontroller.loginUser
// );

// router.get('/profile', authMiddleware.authUser, usercontroller.getUserProfile);
// router.get('/logout', authMiddleware.authUser, usercontroller.logoutUser);

// module.exports = router;