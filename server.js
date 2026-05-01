const express = require("express");
const axios = require("axios");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * STEP 1: Fetch parking data
 */
async function fetchParkingData() {
  const url = "https://nominatim.openstreetmap.org/search";

  try {
    const response = await axios.get(url, {
      params: {
        q: "parking in Vijayawada", // 🔥 change location if needed
        format: "json",
        limit: 50
      },
      headers: {
        "User-Agent": "ParkingApp/1.0"
      }
    });

    return response.data || [];
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
}

/**
 * STEP 2: Store in DB
 */
async function storeParkingData() {
  const data = await fetchParkingData();
  console.log(`Fetched ${data.length} parking spots`);

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO parking_spots 
    (id, name, lat, lng, total_slots, available_slots) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  data.forEach((item) => {
    const name = item.display_name || "Parking Area";
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const total = 50;

    if (!lat || !lng) return;

    stmt.run(
      item.place_id,
      name,
      lat,
      lng,
      total,
      Math.floor(Math.random() * total)
    );
  });

  console.log("Parking data stored!");
}

/**
 * STEP 3: Simulate availability
 */
function simulateAvailability() {
  setInterval(() => {
    try {
      db.prepare(`
        UPDATE parking_spots
        SET available_slots = ABS(RANDOM()) % total_slots
      `).run();
    } catch (err) {
      console.error("Update error:", err.message);
    }
  }, 5000);
}

/**
 * API: Get all parking
 */
app.get("/parking", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM parking_spots").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Start server
 */
app.listen(5000, async () => {
  console.log("Server running on port 5000");

  await storeParkingData();
  simulateAvailability();
});