import { getUser } from "../service/auth.js";

//authentication
const checkForAuthentication = (req, res, next) => {
  const token = req.cookies?.token;
  req.user = null;
  if (!token) return next();
  const user = getUser(token);
  req.user = user;
  return next();
};


export { checkForAuthentication };
