import mongoose from "mongoose";
import { Schema } from "mongoose";

const attendanceSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee" },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: Date },               // null for Absent records
  checkOut: { type: Date },
  status: { type: String, default: "Present", enum: ["Present", "Absent", "Sick", "Leave"] },
  createdAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
