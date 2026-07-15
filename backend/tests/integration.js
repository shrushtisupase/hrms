import mongoose from "mongoose";
import app from "../src/app.js";
import "dotenv/config";

// helper to run fetch requests
const request = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
};

// entry point for integration tests
const runTests = async () => {
  console.log("starting integration tests...");
  await mongoose.connect(process.env.MONGODB_URI);

  const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`test server listening on port ${port}`);

    try {
      // 1. test login
      console.log("\ntesting login...");
      const loginRes = await request(`${baseUrl}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "admin@hrms.com", password: "password123" }),
      });
      if (loginRes.status !== 200 || !loginRes.data.token) {
        throw new Error("admin login failed");
      }
      const adminToken = loginRes.data.token;
      console.log("admin login success.");

      const empLogin = await request(`${baseUrl}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email: "employee@hrms.com", password: "password123" }),
      });
      if (empLogin.status !== 200 || !empLogin.data.token) {
        throw new Error("employee login failed");
      }
      const empToken = empLogin.data.token;
      const empId = empLogin.data.user.id;
      console.log("employee login success.");

      // 2. test security / route protection
      console.log("\ntesting route protection...");
      const protectRes = await request(`${baseUrl}/departments`);
      if (protectRes.status !== 401) {
        throw new Error("protected routes should return 401 without token");
      }
      console.log("route protection verified.");

      // 3. test departments management
      console.log("\ntesting department CRUD...");
      const listDept = await request(`${baseUrl}/departments`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (listDept.status !== 200 || !listDept.data.departments) {
        throw new Error("failed to list departments");
      }

      const createDept = await request(`${baseUrl}/departments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ name: "marketing", description: "marketing dept" }),
      });
      if (createDept.status !== 201) {
        throw new Error("failed to create department");
      }
      const newDeptId = createDept.data.department._id;
      console.log("department creation verified.");

      // 4. test register new employee
      console.log("\ntesting registration validation & creation...");
      const regRes = await request(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          email: "testemp@hrms.com",
          password: "password123",
          firstName: "test",
          lastName: "employee",
          joiningDate: "2026-07-01",
          department: newDeptId,
          basicSalary: 4500,
        }),
      });
      if (regRes.status !== 201) {
        throw new Error(`failed to register new employee: ${JSON.stringify(regRes.data)}`);
      }
      console.log("employee registration verified.");

      // 5. test profile endpoint
      console.log("\ntesting self profile fetch & update...");
      const profileRes = await request(`${baseUrl}/employees/profile`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      if (profileRes.status !== 200 || profileRes.data.user.email !== "employee@hrms.com") {
        throw new Error("failed to get self profile");
      }

      const updateProfile = await request(`${baseUrl}/employees/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${empToken}` },
        body: JSON.stringify({ firstName: "updatedname" }),
      });
      if (updateProfile.status !== 200 || updateProfile.data.user.firstName !== "updatedname") {
        throw new Error("failed to update profile");
      }
      console.log("employee profile endpoints verified.");

      // 6. test attendance check-in & check-out
      console.log("\ntesting attendance flow...");
      const checkinRes = await request(`${baseUrl}/attendance/checkin`, {
        method: "POST",
        headers: { Authorization: `Bearer ${empToken}` },
      });
      if (checkinRes.status !== 201) {
        throw new Error(`failed to check in: ${JSON.stringify(checkinRes.data)}`);
      }

      const checkoutRes = await request(`${baseUrl}/attendance/checkout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${empToken}` },
      });
      if (checkoutRes.status !== 200) {
        throw new Error(`failed to check out: ${JSON.stringify(checkoutRes.data)}`);
      }
      console.log("attendance flow verified.");

      // 7. test leave application & approval (using transaction)
      console.log("\ntesting leave application & approval...");
      const applyLeave = await request(`${baseUrl}/leaves`, {
        method: "POST",
        headers: { Authorization: `Bearer ${empToken}` },
        body: JSON.stringify({
          leaveType: "SICK",
          startDate: "2026-07-20",
          endDate: "2026-07-22",
          reason: "not feeling well",
        }),
      });
      if (applyLeave.status !== 201) {
        throw new Error(`failed to apply leave: ${JSON.stringify(applyLeave.data)}`);
      }
      const leaveId = applyLeave.data.leave._id;

      const approveLeave = await request(`${baseUrl}/leaves/${leaveId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: "APPROVED", remarks: "take care" }),
      });
      if (approveLeave.status !== 200) {
        throw new Error(`failed to approve leave: ${JSON.stringify(approveLeave.data)}`);
      }
      console.log("leave application & transaction-based approval verified.");

      // 8. test payroll generation
      console.log("\ntesting payroll generation...");
      const genPayroll = await request(`${baseUrl}/payroll/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ month: 7, year: 2026 }),
      });
      if (genPayroll.status !== 201) {
        throw new Error(`failed to generate payroll: ${JSON.stringify(genPayroll.data)}`);
      }

      const payrollList = await request(`${baseUrl}/payroll?month=7&year=2026`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (payrollList.status !== 200 || payrollList.data.payrolls.length === 0) {
        throw new Error("failed to retrieve generated payrolls");
      }
      const targetPayroll = payrollList.data.payrolls.find((p) => p.employee._id === empId || p.employee.email === "employee@hrms.com");
      if (!targetPayroll) {
        throw new Error("employee payroll not generated");
      }
      console.log("payroll generation verified.");

      // 9. test payslip pdf download
      console.log("\ntesting payslip pdf download...");
      const pdfRes = await fetch(`${baseUrl}/payroll/${targetPayroll._id}/payslip`, {
        headers: { Authorization: `Bearer ${empToken}` },
      });
      if (pdfRes.status !== 200 || pdfRes.headers.get("content-type") !== "application/pdf") {
        throw new Error("payslip pdf download failed");
      }
      console.log("payslip pdf generation verified.");

      // 10. test dashboard stats
      console.log("\ntesting dashboard stats...");
      const dashRes = await request(`${baseUrl}/dashboard`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (dashRes.status !== 200 || !dashRes.data.stats) {
        throw new Error("failed to get dashboard stats");
      }
      console.log("dashboard stats verified.");

      console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<");
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error("\nTEST RUN FAILED:", err.message);
      server.close();
      await mongoose.disconnect();
      process.exit(1);
    }
  });
};

runTests();
