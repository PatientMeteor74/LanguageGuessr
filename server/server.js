import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js";
import { faker } from '@faker-js/faker';

dotenv.config();
const app = express();

// UUID validation helper - prevents Postgres errors from invalid UUID format
const isValidUUID = (str) => 
{
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof str === 'string' && uuidRegex.test(str);
};

app.options('/api/daily-words', cors())
app.use(cors({
    origin: 'https://lingoguess.vercel.app',
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); 

//const express = require('express');

// Example route
//app.get('/api/some-endpoint', (req, res) => 
//{
    //const userIp = req.userIp; 
    //res.json({ message: `Your IP is ${userIp}` }); 
//});

//app.listen(3000, () => console.log('Server running on port 3000'));

// Root route
app.get("/", (req, res) => 
{
    res.send("Server is on... 👅");
});

app.get("/api/health", async (req, res) => 
{
    const health = {
        server: true,
        database: false,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
    
    try {
        const result = await db.query("SELECT NOW()");
        health.database = true;
        health.dbTime = result.rows[0].now;
        
        // Also check if users table exists
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        `);
        health.usersTableExists = tableCheck.rows[0].exists;
        
        res.json(health);
    } catch (err) {
        console.error("Health check failed:", err);
        health.error = err.message;
        res.status(500).json(health);
    }
});

// Database connection test
app.get("/api/test-db", async (req, res) => 
{
    try {
        const result = await db.query("SELECT NOW()");
        res.json({ connected: true, time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ connected: false, error: err.message });
    }
});

app.get("/api/users", async (req,res)=>
{
    try 
    {
        const result = await db.query("SELECT * FROM users");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "DB query failed" });
    }
});

app.post("/api/users", async (req, res) => 
{
    try 
    {
        const result = await db.query(
        "INSERT INTO users DEFAULT VALUES RETURNING *"
        );
        res.json(result.rows[0]); // should contain the new row
    } catch (err) {
        console.error("Error inserting user:", err);
        res.status(500).json({ error: "DB insert failed" });
    }
});

app.post("/api/daily-words", (req, res) => 
{
    try 
    {
        const { languages, totalWords = 5 } = req.body;
        if (!languages || !Array.isArray(languages)) 
        {
            return res.status(400).json({ error: "Invalid languages data" });
        }
        
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        // Sum year + month + day
        const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0); 

        // Flatten all words
        const allWords = [];
        languages.forEach(lang => 
        {
            if (lang.dictionary && Array.isArray(lang.dictionary)) 
            {
                lang.dictionary.forEach(word => 
                {
                    allWords.push({
                        word: word.word || '',
                        language: lang.name || '',
                        translation: word.translation || '',
                        meaning: word.definition_1 || "No definition available"
                    });
                });
            }
        });

        // Deterministic shuffle using Fisher Yates algorithm
        for (let i = allWords.length - 1; i > 0; i--) 
        {
            const j = (seed + i) % (i + 1);
            [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
        }
        // Take first N words
        const dailyBank = allWords.slice(0, Math.min(totalWords, allWords.length));
        res.json(dailyBank);
    } catch (err) {
        console.error("Daily words error:", err);
        res.status(500).json({ error: "Failed to generate daily words" });
    }
});



// After game is finished, query database with a new score and return user object row if valid request
async function updateScore(id, score) 
{

    // Validate score range
    if (score < 0 || score > 100) 
    {
        throw new Error(`Invalid score: ${score}. Score must be between 0 and 100.`);
    }

    // Validate that score is a number
    if (typeof score !== 'number' || isNaN(score)) 
    {
        throw new Error(`Invalid score type: ${typeof score}. Score must be a number.`);
    }
    // Coalesce returns the first non null element of the arguments
    // Explicitly casts the type using ::numeric
    const query = `
        UPDATE users
        SET played_today = TRUE,
            daily_score = $2::numeric,
            avg_score = CASE 
                WHEN total_games IS NULL OR total_games = 0 THEN $2::numeric
                ELSE ((COALESCE(avg_score, 0::numeric) * total_games + $2::numeric) / (total_games + 1))
                END,
            total_games = COALESCE(total_games, 0) + 1
        WHERE id = $1
        RETURNING *;
    `;

    const values = [id, score];

    try 
    {
        console.log("updateScore called with:", id, score, typeof score);
        const result = await db.query(query, values);
        console.log("DB result:", result.rows);
        return result.rows[0];
    } catch (err) {
        console.error("Error updating score: ", err);
        throw err;
    }
}

// id and word integer
async function updateProgress(id, wordNumber) 
{
    const query = `
        UPDATE users
        SET progress_today = $2
        WHERE id = $1
        RETURNING *;
    `

    try
    {
        const result = await db.query(query, [id, wordNumber]);
        return result.rows[0];
    } catch (err) {
        console.error("Error updating progress: ", err);
        throw err;
    }
}

async function getUser(id) 
{
    const query = `
        SELECT * FROM users WHERE id = $1;
    `

    try
    {
        const result = await db.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        console.error("Error getting user: ", err);
        throw err;
    }
}

async function resetDailyProgress(id) 
{
    const query = `
        UPDATE users
        SET played_today = FALSE,
            daily_score = 0,
            progress_today = 0
        WHERE id = $1
        RETURNING *;
    `;

    try 
    {
        const result = await db.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        console.error("Error resetting daily progress: ", err);
        throw err;
    }
}

app.get("/api/user/:id", async (req, res) => 
{
    const { id } = req.params;

    // Validate UUID format to prevent Postgres errors
    if (!isValidUUID(id)) 
    {
        console.log(`Invalid UUID format: ${id}`);
        return res.status(404).json({ error: "User not found" });
    }

    try
    {
        const user = await getUser(id);
        if (!user) 
        {
            console.log(`User not found in DB: ${id}`);
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Get user error for id:", id);
        console.error("Error details:", err.message);
        console.error("Error stack:", err.stack);
        res.status(500).json({ error: "Failed to get user", details: err.message });
    }
});

app.post("/api/new-user", async (req, res) =>
{
    try
    {
        const result = await db.query(
            "INSERT INTO users DEFAULT VALUES RETURNING id;"
        );
        const newID = result.rows[0].id;
        res.json({ id: newID });
        console.log(`new id: ${newID}`);
    } catch (err) {
        console.error("DB insert error: ",err.message);
        res.status(500).json({ error: "Database insert failed" });
    }
});

app.post("/api/update-score", async (req, res) => 
{
    const { id, newScore } = req.body;
    // Validate whether the id and new score exist
    if (!id || typeof newScore === 'undefined')
    {
        return res.status(400).json({ error: "Missing id or newScore" });
    }
    
    // Validate UUID format
    if (!isValidUUID(id)) 
    {
        return res.status(400).json({ error: "Invalid user id format" });
    }
    
    try
    {
        const user = await updateScore(id, newScore);
        if (!user) 
        {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Update-score error:", err);   // full log
        res.status(500).json({ error: err.message }); // send DB error to frontend
    }
    
});

app.post("/api/update-progress", async (req, res) => 
{
    const { id, wordNumber } = req.body;

    if (!id || typeof wordNumber === 'undefined') 
    {
        return res.status(400).json({ error: "Missing id or wordNumber" });
    }
    
    // Validate UUID format
    if (!isValidUUID(id)) 
    {
        return res.status(400).json({ error: "Invalid user id format" });
    }

    try
    {
        const user = await updateProgress(id, wordNumber);
        if (!user) 
        {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Update progress error:", err);
        res.status(500).json({ error: "Failed to update progress" });
    }
});

app.post("/api/reset-daily-progress", async (req, res) => 
{
    const { id } = req.body;

    if (!id) 
    {
        return res.status(400).json({ error: "Missing user id" });
    }
    
    // Validate UUID format
    if (!isValidUUID(id)) 
    {
        return res.status(400).json({ error: "Invalid user id format" });
    }

    try 
    {
        const user = await resetDailyProgress(id);
        if (!user) 
        {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error("Reset daily progress error:", err);
        res.status(500).json({ error: "Failed to reset daily progress" });
    }
});

// Danger: Debug-only route to clear all users
app.delete("/api/debug/reset-users", async (req, res) => 
{
    try 
    {
        await db.query("TRUNCATE TABLE users CASCADE;");
        res.json({ success: true, message: "All users reset." });
    } catch (err) {
        console.error("Error resetting users:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// Debug: populate with random users
app.post("/api/debug/populate-users", async (req, res) => 
{
    try 
    {
        const count = req.body.count || 5; // default to 5 fake users

        const insertedUsers = [];
        for (let i = 0; i < count; i++) 
        {
            const dailyScore = Math.floor(Math.random() * 20);
            const totalGames = Math.floor(Math.random() * 20) + 1;
            const avgScore = (dailyScore / totalGames).toFixed(2);

            const result = await db.query(
                `INSERT INTO users (played_today, daily_score, avg_score, total_games) 
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [Math.random() > 0.5, dailyScore, avgScore, totalGames]
            );

            insertedUsers.push(result.rows[0]);
        }

        res.json({ success: true, inserted: insertedUsers.length, users: insertedUsers });
        
    } catch (err) {
        console.error("Populate failed:", err);
        res.status(500).json({ error: "DB populate failed" });
    }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
