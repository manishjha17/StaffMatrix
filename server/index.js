import express from 'express'
import cors from 'cors'
import User from './models/User.js';
import bcrypt from 'bcrypt';
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRouter from './routes/auth.js'
import connectToDatabase from './db/db.js'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import dasboardRouter from './routes/dashboard.js'
import settingRouter from './routes/setting.js'
import attendanceRouter from './routes/attendance.js'
import companyRouter from './routes/company.js'
import announcementRouter from './routes/announcement.js'
import supportRouter from './routes/support.js'
import landingRouter from './routes/landing.js'
import { startAttendanceCron } from './tasks/attendanceTask.js'

connectToDatabase()
startAttendanceCron()

const app=express()

// Security Middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// CORS configuration for production deployment
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json())
app.use(express.static('public/uploads'))
app.use('/api/auth', authRouter)
app.use('/api/company', companyRouter)
app.use('/api/landing', landingRouter)
app.use('/api/department',departmentRouter)
app.use('/api/employee',employeeRouter)
app.use('/api/salary',salaryRouter)
app.use('/api/leave',leaveRouter)
app.use('/api/setting',settingRouter)
app.use('/api/dashboard',dasboardRouter)
app.use('/api/attendance', attendanceRouter)
app.use('/api/announcement', announcementRouter)
app.use('/api/support', supportRouter)

// Temporary seeder route
app.get('/seed-admin', async (req, res) => {
    try {
        const email = process.env.DEFAULT_SUPERADMIN_EMAIL;
        const password = process.env.DEFAULT_SUPERADMIN_PASSWORD;

        if (!email || !password) {
            return res.send("Error: Missing env variables");
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: "Super Admin",
            email: email,
            password: hashPassword,
            role: "superadmin"
        });
        await newUser.save();
        res.send("Admin account created successfully! You can now delete this route.");
    } catch (error) {
        res.send("Error: " + error.message);
    }
});

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})

