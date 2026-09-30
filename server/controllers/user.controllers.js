import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: true,
    secure:false,
}

export const registerUser = async (req, res) => {
    try {
        const {username, email, password} = req.body
        if (!username || !email || !password){
            return res.status(400).json({message: "All fields required."})
        }


        const passwordChecks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            specialChar: /[#@$!%*?&]/.test(password),
        }
        const isPasswordValid = Object.values(passwordChecks).every(Boolean);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Password does not meet requirements.",
                passwordChecks
            })
        }
        

        const userExists = await User.findOne({username})
        const emailExists = await User.findOne({email})
        if (userExists || emailExists) {
            return res.send(409).json({message: "User already exists"})
        }

        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)



        const newUser = await User.create({
            username, 
            email,
            password: hashedPassword
        })


        const token = genToken(newUser._id)
        res.cookie('token', token, cookieOptions)

        return res.status(201).json({message: 'User Registered', user: newUser})
    } catch (error) {
        return res.status(500).json({message: "server crashed", error: error.message})
    }
}