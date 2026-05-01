const express = require("express");
const axios = require("axios");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

/**
 * STEP 1: Fetch parking data from Nominatim API
 */
async function fetchParkingData() {
  const url = "https://nominatim.openstreetmap.org/search";

  try {
    const response = await axios.get(url, {
      params: {
        q: "parking in Hyderabad", // Change "London" to your actual city!
        format: "json",
        limit: 50
      },
      headers: {
        "User-Agent": "NodeJS-ParkingApp/1.0"
      }
    });

    return response.data || [];
  } catch (error) {
    console.error("Nominatim API Error:", error.message);
    return [];
  }
}

/**
 * STEP 2: Store in DB
 */
async function storeParkingData() {
  const data = await fetchParkingData();
  console.log(`Fetched ${data.length} parking spots from Nominatim.`);

  data.forEach((item) => {
    const name = item.name || "Parking Area";
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const total = 50;

    if (!lat || !lng) return;

    db.run(
      `INSERT OR IGNORE INTO parking_spots 
      (id, name, lat, lng, total_slots, available_slots) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        item.place_id,
        name,
        lat,
        lng,
        total,
        Math.floor(Math.random() * total)
      ],
      (err) => {
        if (err) console.error("Insert error:", err.message);
      }
    );
  });

  console.log("Parking data stored!");
}

/**
 * STEP 3: Simulate real-time availability
 */
function simulateAvailability() {
  setInterval(() => {
    db.run(`
      UPDATE parking_spots
      SET available_slots = ABS(RANDOM()) % total_slots
    `, (err) => {
      if (err) console.error("Update error:", err.message);
    });
  }, 5000);
}

/**
 * API: Get all parking
 */
app.get("/parking", (req, res) => {
  db.all("SELECT * FROM parking_spots", [], (err, rows) => {
    if (err) {
      console.error("Select error:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * Start server
 */
app.listen(5000, async () => {
  console.log("Server running on port 5000");

  try {
    await storeParkingData();   // Step 1 + 2
    simulateAvailability();     // Step 3
  } catch (error) {
    console.error("Failed to fetch or store parking data:", error.message);
  }
});