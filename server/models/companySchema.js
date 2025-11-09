import mongoose from "mongoose"
import bcrypt from "bcrypt"

//  Address Schema
const addressSchema = {
  street: { type: String, default: "" },
  city: { type: String, default: "" },
  state: { type: String, default: "" },
  country: { type: String, default: "" },
  pincode: { type: String, default: "" },
}

// Email Schema
const emailSchema = {
  userEmail: { type: String, required: true },
  verified: { type: Boolean, default: false },
}

//  Contact Person Schema
const contactPersonSchema = {
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String, required: true },
}

//  Company Details Schema
const companyDetailsSchema = {
  name: { type: String, required: true },
  est_year: { type: String, required: true },
  address: { type: Object, default: addressSchema },
  bio: { type: String, required: true },
  website: { type: String },
  industryType: { type: String, required: true },
  founders: { type: Array },
  hrEmail: { type: String, required: true },
}

//  Main Company Schema
const companySchema = new mongoose.Schema(
  {
    companyDetails: {
      type: Object,
      required: true,
      default: companyDetailsSchema,
    },
    contact_person: {
      type: Object,
      required: true,
      default: contactPersonSchema,
    },
    email: {
      type: Object,
      required: true,
      default: emailSchema,
    },
    phone: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
    },
    documents: {
      type: Array,
      default: [],
    },
    createJobs: {
      type: Array,
      default: [],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
)

//  Password Hashing Middleware
companySchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
  } catch (err) {
    next(err)
  }
})

// Model Creation
const companyModel = mongoose.model("companies", companySchema)

export { companyModel }
