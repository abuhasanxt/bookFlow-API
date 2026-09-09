import dotenv from "dotenv";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

dotenv.config();
interface EnvConfig {
  NODE:string;
  PORT: string;
  DATABASE_URL: string;
}

const loadEnvVariables = () => {
  const requiredEnvVariable = ["NODE","PORT", "DATABASE_URL"];
  requiredEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file`,
      );
    }
  });
  return {
    NODE:process.env.NODE as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
