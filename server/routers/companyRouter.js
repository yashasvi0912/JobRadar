import express from "express"
import {
  handleCompanyRegister,
  handleOTPVerification,
  handleCompanyLogin,
  handleResetPasswordRequest,
  handleOTPForPasswordReset,
  handleResetPasswordRequestOldToNew,
  handleCompanyFileUpload
} from "../controllers/companyController.js"

import { AuthCompany } from "../middlewares/AuthCompany.js"
import { uploadCompany } from "../config/multerConfig.js"

const companyRouter = express.Router()

//  Company Authentication Routes

companyRouter.post("/register", handleCompanyRegister)
companyRouter.post("/verify-otp", handleOTPVerification)
companyRouter.post("/company-login", handleCompanyLogin)


// Password Management Routes

companyRouter.post("/password-reset-request", handleResetPasswordRequest)
companyRouter.post("/verify-reset-password-request", handleOTPForPasswordReset)
companyRouter.patch("/old-password-newPassword", AuthCompany, handleResetPasswordRequestOldToNew)

//  File Upload Routes
// Upload company-related documents (e.g., logo, certificates)
companyRouter.post(
  "/upload-file/:file_type",
  AuthCompany,
  uploadCompany.single("file"),
  handleCompanyFileUpload
)

export { companyRouter }
