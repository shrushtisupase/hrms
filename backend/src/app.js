import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import resignationRoutes from "./routes/resignation.routes.js";

const app = express();

// enable cors and parse json body
// custom cors middleware to allow wildcard origin access and handle preflight options
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
    : ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"];

  if (origin && (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

  // handle preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

// api routes
app.use("/auth", authRoutes);
app.use("/departments", departmentRoutes);
app.use("/employees", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leaves", leaveRoutes);
app.use("/payroll", payrollRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/resignation", resignationRoutes);

// global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    success: false,
    message: "something went wrong on the server",
  });
});

export default app;