const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'esports'
});

db.connect(err => {
  if (err) {
    console.log("❌ DB Connection Failed:", err);
  } else {
    console.log('✅ MySQL Connected...');
  }
});

/* ================= AUTH ================= */

// REGISTER USER / ORGANIZER
app.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields required");
  }

  const userRole = role || 'user';

  db.query(
    'INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)',
    [name, email, password, userRole],
    (err) => {
      if (err) {
        console.log("❌ Register Error:", err);
        return res.status(500).send("User already exists or DB error");
      }
      res.send("✅ Registered Successfully");
    }
  );
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email=? AND password=?',
    [email, password],
    (err, result) => {
      if (err) {
        console.log("❌ Login Error:", err);
        return res.status(500).send("Server Error");
      }

      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.send('Invalid Credentials');
      }
    }
  );
});

/* ================= TOURNAMENT ================= */

// GET ALL TOURNAMENTS
app.get('/tournaments', (req, res) => {
  db.query('SELECT * FROM tournaments', (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching tournaments");
    }
    res.json(result);
  });
});

// CREATE TOURNAMENT (Organizer)
app.post('/createTournament', (req, res) => {
  const { name, game, entry_fee, prize, date, organizer_id } = req.body;

  if (!name || !game || !entry_fee || !prize || !date) {
    return res.status(400).send("All fields required");
  }

  db.query(
    `INSERT INTO tournaments 
     (name,game,entry_fee,prize,date,organizer_id) 
     VALUES (?,?,?,?,?,?)`,
    [name, game, entry_fee, prize, date, organizer_id || null],
    (err, result) => {
      if (err) {
        console.log("❌ Create Tournament Error:", err);
        return res.status(500).send("Error creating tournament");
      }

      res.send("✅ Tournament Created Successfully");
    }
  );
});

// UPDATE MATCH DETAILS
app.post('/updateMatch/:id', (req, res) => {
  const id = req.params.id;
  const { room_id, room_password, match_time } = req.body;

  if (!room_id || !room_password || !match_time) {
    return res.status(400).send("All match fields required");
  }

  db.query(
    `UPDATE tournaments 
     SET room_id=?, room_password=?, match_time=? 
     WHERE id=?`,
    [room_id, room_password, match_time, id],
    (err, result) => {
      if (err) {
        console.log("❌ Update Match Error:", err);
        return res.status(500).send("Error updating match");
      }

      res.send("✅ Match Updated Successfully");
    }
  );
});

// GET ORGANIZER TOURNAMENTS
app.get('/myTournaments/:organizerId', (req, res) => {
  const organizerId = req.params.organizerId;

  db.query(
    'SELECT * FROM tournaments WHERE organizer_id=?',
    [organizerId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error fetching organizer tournaments");
      }
      res.json(result);
    }
  );
});

/* ================= REGISTRATION ================= */

// REGISTER FOR TOURNAMENT
app.post('/registerTournament', (req, res) => {
  const { userId, tournamentId, utr } = req.body;

  if (!userId || !tournamentId) {
    return res.status(400).send("Missing data");
  }

  db.query(
    `INSERT INTO registrations 
     (user_id, tournament_id, payment_status, utr) 
     VALUES (?,?,?,?)`,
    [userId, tournamentId, 'pending', utr || null],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Already registered or error");
      }
      res.send("✅ Submitted for Verification");
    }
  );
});

// USER REGISTRATIONS
app.get('/myRegistrations/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query(
    `SELECT 
        t.id AS tournament_id,
        t.name,
        t.game,
        t.entry_fee,
        r.payment_status
     FROM registrations r
     JOIN tournaments t ON r.tournament_id = t.id
     WHERE r.user_id = ?`,
    [userId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error fetching registrations");
      }
      res.json(result);
    }
  );
});

// APPROVED TOURNAMENTS
app.get('/myApprovedTournaments/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query(
    `SELECT 
        t.id,
        t.name,
        t.game,
        t.entry_fee,
        t.prize,
        t.date,
        t.room_id,
        t.room_password,
        t.match_time
     FROM registrations r
     JOIN tournaments t ON r.tournament_id = t.id
     WHERE r.user_id = ? AND r.payment_status = 'approved'`,
    [userId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error fetching approved tournaments");
      }
      res.json(result);
    }
  );
});

/* ================= SERVER ================= */

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});