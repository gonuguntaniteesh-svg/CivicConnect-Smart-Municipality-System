const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

require("dotenv").config();

const Complaint = require("./models/Complaint");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

/* ✅ THIS MUST BE ABOVE app.listen() */

app.post("/api/complaints", async (req, res) => {
    try {
        const newComplaint = new Complaint(req.body);
        await newComplaint.save();
        res.status(201).json(newComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.put("/api/complaints/:id", async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/complaints", async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: "user"
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            "secretKey",
            { expiresIn: "1d" }
        );

        res.json({
            token,
            role: user.role,
            name: user.name
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.put("/api/complaints/:id", async (req, res) => {
    try {
        const updated = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});