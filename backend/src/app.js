// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
const server = createServer(app);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
  })
);


const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend
  },
});

// Global socket instance src/app.js
global._io = io;

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

import patientRouter from './routes/patient.route.js'
app.use('/api/patient', patientRouter)

export {server, express}