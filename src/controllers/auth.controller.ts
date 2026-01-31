import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.models";

const JWT_SECRET = process.env.JWT_SECRET || "Sporton123";

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials, wrong password" });
            return;
        }
        // Generate JWT token
        const token  = jwt.sign({id: user._id, email: user.email}, JWT_SECRET, {
            expiresIn: "1d"
        })

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ message: "Internal server error" });
        }

    };

    export const initiateAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, name } = req.body;

            // Check if admin user already exists
            const count = await User.countDocuments({});
            if (count > 0) {
                res.status(400).json({ message: "Admin user already exists" });
                return;
            }
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User ({
                email,
                password: hashedPassword,
                name,
            })
            await newUser.save();

            res.status(201).json({ message: "Admin user created successfully" });
        } catch (error) {
            console.error("Initiate admin error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }