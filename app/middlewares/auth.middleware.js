const userModel = require('../../models/user.model');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../../models/blacklistToken.model');

module.exports.authUser = async(req) =>{
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];
    if(!token)
    {
       return { error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };
    }

    const isblacklisted = await blacklistTokenModel.findOne({token: token});

    if(isblacklisted)
    {
       return { error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };
    }     

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return { error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };
        }
        return {user}

    } catch (error) {
       return { error: new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }) };
    }
}
