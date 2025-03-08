import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express.Router();

const serviceAccount = {
    project_id: process.env.PROJECT_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.CLIENT_EMAIL,
};

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const data = {
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
    relay5: false,
    relay6: false,
    relay7: false,
    relay8: false,
};

// Express Endpoint to Check Health Status
app.get("/health", async (req, res) => {
    try {
        const snapshot = await db.ref("/relays").get();
        const finalValue = snapshot.toJSON();
        const arr = Object.values(finalValue).map(value => (value ? 1 : 0));

        console.log(finalValue);
        res.status(200).json({ status: "healthy", data: arr });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// Express Endpoint to Update Relay Data
app.post("/data", async (req, res) => {
    try {
        req.body.data.forEach((value, index) => {
            data[`relay${index + 1}`] = value;
        });

        await db.ref("/relays").update(data);
        res.json({ msg: "success" });
    } catch (error) {
        console.error("Error updating data:", error);
        res.status(500).json({ status: "error", message: "Failed to update data" });
    }
});

export { app, db };
