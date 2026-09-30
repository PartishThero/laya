import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import genToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true,
    sameSite: true,
    secure: false,
}

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields required." })
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

        const userExists = await User.findOne({ username })
        const emailExists = await User.findOne({ email })
        if (userExists || emailExists) {
            return res.send(409).json({ message: "User already exists" })
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

        return res.status(201).json({ message: 'User Registered', user: newUser })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.send(400).json({ message: "All fields required" })
        }


        const user = await User.findOne({ username })
        if (!user) {
            return res.send(409).json({ message: "User doesnot exist" })
        }


        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.send(401).json({ message: "The password is incorrect." })
        }

        const token = genToken(user._id)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false
        })

        const authenticatedUser = user.toObject()
        delete authenticatedUser.password
        return res.status(200).json({ message: 'User logged in', user: authenticatedUser })

    } catch (error) {
        return res.send(500).json({ message: "Internal Server Error", error: error.message })
    }
}

export const getMe = async (req, res) => {
    const authenticatedUser = req.user
    return res.status(200).json({user: authenticatedUser })
}