// pages/api/sendEmail.ts

import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { validateToken } from "serverFunctions/routeGuards";

type Data = {
  status: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  validateToken(req, res, process.env.NEXT_PUBLIC_EMAIL_TOKEN, () => {
    if (req.method === "POST") {
      let transporter = nodemailer.createTransport({
        service: "gmail", // using gmail for this example
        auth: {
          user: process.env.NEXT_PUBLIC_EMAIL_USER,
          pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
        },
      });

      let mailOptions = {
        from: process.env.NEXT_PUBLIC_EMAIL_USER,
        to: req.body.to, // list of receivers from the request body
        subject: req.body.subject, // Subject line from the request body
        text: req.body.text, // plain text body from the request body
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log({ error });
          res.status(500).json({ status: "Email not sent" + error.message });
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).json({ status: "Email sent" });
        }
      });
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
}
