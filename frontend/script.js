/* ===========================
   AUTHENTICATION SECTION
=========================== */

async function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            window.location.href = "login.html";
        }

    } catch (error) {
        alert("Registration failed");
    }
}


async function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        // Store login details
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("email", email);

        // Redirect based on role
        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "user.html";
        }

    } catch (error) {
        alert("Login failed");
    }
}


function logoutUser() {
    localStorage.clear();
    window.location.href = "login.html";
}


/* ===========================
   USER PORTAL SECTION
=========================== */

async function submitComplaint() {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const problemType = document.getElementById("problemType").value;
    const description = document.getElementById("description").value;

    const complaintData = {
        name,
        email,
        problemType,
        description
    };

    try {
        const response = await fetch("http://localhost:5000/api/complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(complaintData)
        });

        if (!response.ok) {
            alert("Failed to submit complaint");
            return;
        }

        alert("Complaint submitted successfully!");
        loadUserComplaints();

    } catch (error) {
        alert("Error submitting complaint");
    }
}


async function loadUserComplaints() {
    const email = localStorage.getItem("email");

    try {
        const response = await fetch("http://localhost:5000/api/complaints");
        const complaints = await response.json();

        const table = document.getElementById("complaintTable");
        if (!table) return;

        table.innerHTML = "";

        complaints.forEach(c => {
            if (c.email === email) {
                table.innerHTML += `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.problemType}</td>
                        <td>${c.status}</td>
                    </tr>
                `;
            }
        });

    } catch (error) {
        console.error("Error loading complaints");
    }
}


/* ===========================
   ADMIN PORTAL SECTION
=========================== */

function getStatusBadge(status) {
    if (status === "Pending")
        return `<span class="badge pending">Pending</span>`;
    if (status === "Processed")
        return `<span class="badge processed">Processed</span>`;
    if (status === "Solved")
        return `<span class="badge solved">Solved</span>`;
}


async function loadAllComplaints() {
    try {
        const response = await fetch("http://localhost:5000/api/complaints");
        const complaints = await response.json();

        const table = document.getElementById("adminTable");
        if (!table) return;

        table.innerHTML = "";

        complaints.forEach(c => {
            table.innerHTML += `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.problemType}</td>
                    <td>${c.description}</td>
                    <td>${getStatusBadge(c.status)}</td>
                    <td>
                        <select onchange="updateStatus('${c._id}', this.value)">
                            <option ${c.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option ${c.status === "Processed" ? "selected" : ""}>Processed</option>
                            <option ${c.status === "Solved" ? "selected" : ""}>Solved</option>
                        </select>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error loading complaints");
    }
}


async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to update status");
            return;
        }

        loadAllComplaints();

    } catch (error) {
        alert("Error updating status");
    }
}
function checkAdminAccess() {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
        window.location.href = "login.html";
    }
}
function checkUserAccess() {
    const role = localStorage.getItem("role");

    if (role !== "user") {
        window.location.href = "login.html";
    }
}

