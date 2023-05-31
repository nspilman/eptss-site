import { NextApiRequest, NextApiResponse } from "next";

export function validateToken(
  req: NextApiRequest,
  res: NextApiResponse,
  expectedToken: string | undefined,
  next: () => void
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or missing Bearer token" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== expectedToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid Bearer token" });
  }

  next();
}
