
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { companyModel } from "../models/companySchema.js"
import { redisClient } from "../utils/redisClient.js"

dotenv.config({ path: "./config.env" })

//  Email transporter setup for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // secure port
  secure: true,
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_EMAIL_PASSWORD,
  },
})

//  Generate a 4-digit random OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000)
}

//  Send verification OTP to company email
async function sendOTP(email) {
  try {
    const otp = generateOTP()

    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: " Verify Your Email | OTP valid for 5 mins",
      html: `
        <div style="font-family:Arial; background:#f4f6f8; padding:30px;">
          <h2 style="color:#0078ff;">Email Verification</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="background:#0078ff; color:#fff; display:inline-block; padding:10px 20px; border-radius:8px;">
            ${otp}
          </h1>
          <p> OTP valid for 5 minutes. Don’t share it with anyone.</p>
        </div>`,
    }

    await transporter.sendMail(mailOptions)
    await redisClient.setEx(`email:${email}`, 300, otp.toString())

    return { message: "OTP sent successfully!", status: true }
  } catch (err) {
    console.error("Error sending OTP:", err)
    return { message: "Failed to send OTP", status: false }
  }
}

//  Send OTP for password reset
async function sendOTPForPasswordReset(email) {
  try {
    const otp = generateOTP()
    const mailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:Arial; background:#f4f6f8; padding:30px;">
          <h2 style="color:#0078ff;">Reset Your Password</h2>
          <p>Use this OTP to reset your password:</p>
          <h1 style="background:#0078ff; color:#fff; display:inline-block; padding:10px 20px; border-radius:8px;">
            ${otp}
          </h1>
          <p> OTP valid for 5 minutes.</p>
        </div>`,
    }

    await transporter.sendMail(mailOptions)
    await redisClient.setEx(`emailPasswordReset:${email}`, 300, otp.toString())

    return { message: "OTP sent successfully!", status: true }
  } catch (err) {
    console.error("Error sending OTP:", err)
    return { message: "Failed to send OTP", status: false }
  }
}

//  Register a new company
let handleCompanyRegister = async (req, res) => {
  try {
    const { companyDetails, contactPerson, email, password, phone, companyLogo, documents, createJobs } = req.body

    if (!companyDetails || !contactPerson || !email || !password || !phone)
      throw "Missing required data!"

    const exists = await companyModel.findOne({
      $or: [{ "email.companyEmail": email }, { phone }]
    })

    if (exists) throw "Company already registered with this email or phone!"

    // Send OTP to verify email
    const result = await sendOTP(email)
    if (!result.status) throw `Unable to send OTP to ${email}`

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    const newCompany = new companyModel({
      companyDetails,
      contactPerson,
      email: { companyEmail: email, verified: false },
      phone,
      password: hash,
      companyLogo,
      documents,
      createJobs
    })

    await newCompany.save()
    res.status(201).json({ message: `Company registered! Please verify OTP sent to ${email}` })
  } catch (err) {
    console.error("Register error:", err)
    res.status(400).json({ message: "Company registration failed!", err })
  }
}

// Verify OTP for registration
let handleOTPVerifi
