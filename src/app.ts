
import express, { Application, Request, Response } from "express"
import { indexRoutes } from "./routes";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/globalErrorHandler";
const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/",indexRoutes)
// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Book Flow API!');
});
app.use(errorHandler)
app.use(notFound)
export default app;