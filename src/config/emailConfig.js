import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: String("cheers.vivuviet@gmail.com"),
    pass: String("epfh frbk fjgl hsuy"),
  },
});
