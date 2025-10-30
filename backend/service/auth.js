// const sessionIdToUserMap = new Map();
import jwt from "jsonwebtoken";
const setUser = (user) => {
  // sessionIdToUserMap.set(id, user);
  return jwt.sign(
    {
      _id: user._id, // object creation needed not direct object passing like user ..thius is the way it is designed
      // email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};
const getUser = (token) => {
  // return sessionIdToUserMap.get(id);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export { setUser, getUser };
