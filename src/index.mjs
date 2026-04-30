import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Only need this once at the top

const port = 8000;

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY
);

app.listen(port, () => {
    console.log("App is running on port " + port);
});

app.get("/", (req, res) => {
    res.json({ message: "The backend is running perfectly" });
});

// GET: Fetch all movies
app.get("/api/data", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('movies') // Make sure your table name is 'movies'
            .select('*');

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error(error.message);
        res.status(404).send("Error fetching data from Supabase");
    }
});

// PATCH: Partial update
app.patch("/api/edit/:id", async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    try {
        const { data, error } = await supabase
            .from('movies')
            .update(body)
            .eq('id', id)
            .select(); // Returns the updated row

        if (error) throw error;
        
        console.log(`Movie ${id} successfully updated via PATCH`);
        res.status(200).json(data[0]); 
    } catch (error) {
        console.error("Update Error:", error.message);
        res.status(500).json({ error: "Internal server error during update" });
    }
});

// PUT: Full update (Supabase update works like a merge, effectively doing the same here)
// PUT: Full update
app.put("/api/edit/:id", async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // 1. Convert id to Number (Supabase 'int8' expects an integer, req.params provides a string)
    const numericId = parseInt(id);

    try {
        // 2. We use 'update' instead of 'upsert' for editing existing records to be safe
        const { data, error } = await supabase
            .from('movies')
            .update(body) 
            .eq('id', numericId) 
            .select();

        if (error) {
            console.error("Supabase specific error:", error.message);
            return res.status(400).json({ error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        console.log(`Movie ${id} successfully updated via PUT`);
        res.status(200).json(data[0]); 
    } catch (error) {
        console.error("Server Side Error:", error.message);
        res.status(500).json({ error: "Internal server error during update" });
    }
});


// Add this to your existing Express server
app.get("/api/events", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events') 
            .select('*')
            .order('event_date', { ascending: true }); // Sort by soonest date first

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});


app.put("/api/edit-event/:id", async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // IMPORTANT: Parse the ID to a Number
    const numericId = Number(id);

    const { data, error } = await supabase
        .from('events')
        .update(body) 
        .eq('id', numericId) // Use the numeric version here
        .select();

    if (error) {
        console.error("Supabase Update Error:", error.message);
        return res.status(400).json(error);
    }

    // This helps you see in the terminal if the row was actually found
    if (data.length === 0) {
        console.log(`⚠️ Warning: No event found with ID ${numericId}`);
        return res.status(404).json({ message: "No event found to update" });
    }

    console.log(`✅ Event ${numericId} updated successfully`);
    res.json(data);
});


app.get("/api/teams", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('teams') 
            .select('*')
            .order('id', { ascending: true }); // Sort by soonest date first

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});


app.get("/api/matches", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('matches') 
            .select('*')
            .order('id', { ascending: true }); // Sort by soonest date first

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});