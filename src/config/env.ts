import dotenv from "dotenv";

dotenv.config();
interface EnvConfig {
  PORT: string;
  DATABASE_URL: string;
}

const loadEnvVariables = () => {
  const requiredEnvVariable = ["PORT", "DATABASE_URL"];
  requiredEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file`,
      );
    }
  });
  return {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
