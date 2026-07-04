import mongoose from "mongoose";
import Attendance from "./models/Attendance.js";
import User from "./models/User.js";

const clean = async () => {
    // connect to mongodb
    await mongoose.connect("mongodb://localhost:27017/ems");
    
    // Find all users
    const users = await User.find().select('_id');
    const userIds = users.map(u => u._id);

    // Delete attendance records where userId is not in the list of valid userIds
    const result = await Attendance.deleteMany({ userId: { $nin: userIds } });
    console.log("Deleted orphaned attendance records:", result.deletedCount);
    process.exit(0);
}
clean();
