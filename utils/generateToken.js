import jwt from 'jsonwebtoken';

const generateToken = async (res, user) => {
  try{
    const encryptUser = {
      _id: user._id,
      name: user.name
    }
    const token = jwt.sign({encryptUser}, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
  
    // Set JWT as an HTTP-Only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
      sameSite: 'strict', // Prevent CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return token
  }catch(err){
    const error = new Error("Couldn't generate token");
    error.statusCode = 401;
    throw error;
  }
}

export default generateToken;
