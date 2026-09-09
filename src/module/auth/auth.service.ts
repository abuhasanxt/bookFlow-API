/* eslint-disable @typescript-eslint/no-unused-vars */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { UserData, UserLogin } from "./auth.interface";
import bcrypt from "bcrypt";
import { tokenUtils } from "../../utils/token";

const register = async (payload: UserData) => {
  const { name, email, password } = payload;
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (existingUser) {
    throw new AppError(
      status.CONFLICT,
      "An account with this email already exists. please log in .",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });
  if (!result.email) {
    throw new AppError(status.BAD_REQUEST, "Failed to register user");
  }
  const { passwordHash: _, ...safeUser } = result;
  return safeUser;
};
const login = async (payload: UserLogin) => {
  const { email, password } = payload;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new AppError(
      status.NOT_FOUND,
      "We couldn't find an account with this email. Please sign up first",
    );
  }

  const isPasswordMatched = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatched) {
    throw new AppError(status.BAD_REQUEST, "Invalid email or password");
  }

    const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
  });

  const { passwordHash: _, ...safeUser } = user;
  return {
    ...safeUser,
    accessToken,
    refreshToken,
  };
};
export const authService = {
  register,
  login,
};
