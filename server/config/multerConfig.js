import multer from "multer"; 
import path from "path";     
import fs from "fs";         

// Function: Storage system create karta hai (allowed file types ke sath)
const makeStorage = (types) =>
  multer.diskStorage({
    
    destination(req, file, cb) {
      const type = req.params.file_type; 
      
      // if file type is not allowed throw error 
      if (!types.includes(type)) return cb(new Error("Invalid type"));
      
      //  file Type ke based par folder set
      const dir = path.join(
        "upload",
        type === "resume" ? "resumes" :
        type === "profile_picture" ? "profile_pictures" :
        type === "logo" ? "company_logos" : "others"
      );

     // Create the folder if it doesn't exist
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      cb(null, dir); // set the destination folder
    },

     // Create a unique file name (time + original name)
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
  });


// Uploader for user: only "resume" and "profile_picture" allowed

export const uploadUser = multer({ storage: makeStorage(["resume", "profile_picture"]) });

// Uploader for company: allows "resume", "profile_picture", and "logo"
export const uploadCompany = multer({ storage: makeStorage(["resume", "profile_picture", "logo"]) });
