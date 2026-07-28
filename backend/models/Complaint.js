const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    name: String,
    email: String,
    problemType: String,
    description: String,
    status: {
        type: String,
        default: "Pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Complaint", complaintSchema);
