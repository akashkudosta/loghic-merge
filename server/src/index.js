import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";
import { dbConnect } from "./mongo/index.js";
import { meRoutes, authRoutes } from "./routes/index.js";
import path from "path";
import * as fs from "fs";
import companyRoutes from './routes/company.js'; // Adjust the path as necessary
import postRoutes from './routes/post.js'; // Import the new post routes
import eventRoutes from './routes/event.js'; // Import the new event routes
import userRoutes from './routes/user.js'; // Fix the import path
import fileUpload from 'express-fileupload';
import advisorRoutes from './routes/advisor.js';
import searchRoutes from './routes/search.js'; // Import the new search routes
import messageRoutes from './routes/message.js'; // Import the new message routes
import notificationRoutes from './routes/notification.js'; // Import the new notification routes


dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();

// CORS configuration for frontend running on port 3000
app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   credentials: true
// }));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload middleware
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

dbConnect();

app.get("/", function (req, res) {
  const __dirname = fs.realpathSync(".");
  res.sendFile(path.join(__dirname, "/src/landing/index.html"));
});

app.use("/", authRoutes);
app.use("/me", meRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/posts', postRoutes); // Use the new post routes
app.use('/api/events', eventRoutes); // Use the new event routes
app.use('/api/users', userRoutes); // Use the user routes
app.use('/api/advisors', advisorRoutes);
app.use('/api/search', searchRoutes); // Add the search routes under the /api path
app.use('/api/messages', messageRoutes); // Add the message routes under the /api path
app.use('/api/notifications', notificationRoutes); // Add the notification routes under the /api path

// Static file serving
const uploadsDir = path.join(process.cwd(), 'server/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static('server/uploads'));

app.listen(PORT, () => console.log(`API Server listening to port ${PORT}`));