import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
  };

  // Chỉ thêm partnerTier nếu user là partner
  if (user.role === "partner" && user.partnerTier) {
    payload.partnerTier = user.partnerTier;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export default generateToken;
