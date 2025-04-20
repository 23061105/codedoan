//Tạo json web token
import jwt from "jsonwebtoken";

export const GenerateToken = (userId, res) => {
  const token = jwt.sign(
    { userId } /*Payload*/,
    process.env.JWT_SECRET /*Key bên file .env*/,
    {
      //Hạn 1 token
      expiresIn: "7d",
    }
  );
  //Gửi cookie từ server đến client
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // Chống XSS (cross-site scripting attacks)
    sameSite: "strict", //Chống CSRF (cross-site request forgery attacks)
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
