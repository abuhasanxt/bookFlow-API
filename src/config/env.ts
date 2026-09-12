import dotenv from "dotenv";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

dotenv.config();
interface EnvConfig {
  NODE: string;
  PORT: string;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  EMAIL_SENDER: {
    SMTP_USER: string;
    SMTP_PASSWORD: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_FROM: string;
  };
  CLOUDINARY_CLOUD_NAME:string;
  CLOUDINARY_API_KEY:string;
  CLOUDINARY_API_SECRET:string;
}

const loadEnvVariables = () => {
  const requiredEnvVariable = [
    "NODE",
    "PORT",
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRES_IN",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASSWORD",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  requiredEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file`,
      );
    }
  });
  return {
    NODE: process.env.NODE as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
      SMTP_PASSWORD: process.env.EMAIL_SENDER_SMTP_PASSWORD as string,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    },
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
