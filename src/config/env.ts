import dotenv from "dotenv";

dotenv.config();
interface EnvConfig {
  PORT: string;
}

const loadEnvVariables = () => {
  const requiredEnvVariable = ["PORT"];
  requiredEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file`,
      );
    }
  });
  return {
    PORT: process.env.PORT as string,
  };
};

export const envVars: EnvConfig = loadEnvVariables();
