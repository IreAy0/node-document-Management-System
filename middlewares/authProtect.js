import jwt from 'jsonwebtoken';

export default ( req, res, next ) => {

  let decodedToken;
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    const error = new Error('Not authenticated.')
    error.statusCode = 401;
    throw error
  }
  const token = authHeader.split(' ')[1]
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET );
  } catch (error) {
    error.statusCode = 500;
    throw error
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.')
    error.statusCode = 401;
    throw error
  }
  req.userId = decodedToken.encryptUser
  next()
}