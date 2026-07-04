import express from 'express'
import authMiddleware from  '../middleware/authMiddleware.js'
import { changePassword, updateProfileImage } from '../controllers/settingController.js'
import { upload } from '../controllers/employeeController.js'


const router=express.Router()


router.put('/change-password',authMiddleware,changePassword)
router.post('/profile-image', authMiddleware, upload.single('image'), updateProfileImage)


export default router;