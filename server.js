const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'TA276450@ayush',
  database: 'esports'
});

db.connect(err => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('✅ MySQL Connected...');
});

// ================= AUTH =================

// REGISTER
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  db.query(
    'INSERT INTO users (name,email,password) VALUES (?,?,?)',
    [name, email, password],
    (err, result) => {
      if (err) return res.send('User already exists');
      res.send('Registered Successfully');
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
      if (err) return res.send('Server Error');

      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.send('Invalid Credentials');
      }
    }
  );
});

// ================= ADMIN =================

// GET ALL USERS
app.get('/users', (req, res) => {
  db.query('SELECT id,name,email,role FROM users', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// ================= TOURNAMENT =================

// GET ALL TOURNAMENTS
app.get('/tournaments', (req, res) => {
  db.query('SELECT * FROM tournaments', (err, result) => {
    if (err) return res.send(err);
    res.json(result);
  });
});

// ADD TOURNAMENT (ADMIN)
app.post('/addTournament', (req, res) => {
  const { name, game, prize, entry_fee, date } = req.body;

  db.query(
    'INSERT INTO tournaments (name,game,prize,entry_fee,date) VALUES (?,?,?,?,?)',
    [name, game, prize, entry_fee, date],
    (err, result) => {
      if (err) return res.send(err);
      res.send('Tournament Added');
    }
  );
});

// DELETE TOURNAMENT
app.delete('/deleteTournament/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM tournaments WHERE id=?', [id], (err, result) => {
    if (err) return res.send(err);
    res.send('Tournament Deleted');
  });
});

// ================= REGISTRATION =================

// REGISTER USER TO TOURNAMENT
app.post('/registerTournament', (req, res) => {
  const { userId, tournamentId } = req.body;

  db.query(
    'INSERT INTO registrations (user_id, tournament_id) VALUES (?,?)',
    [userId, tournamentId],
    (err, result) => {
      if (err) return res.send('Already Registered');
      res.send('Registered Successfully');
    }
  );
});

// GET USER REGISTRATIONS
app.get('/myRegistrations/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query(
    `SELECT t.name, t.game, t.entry_fee 
     FROM registrations r
     JOIN tournaments t ON r.tournament_id = t.id
     WHERE r.user_id = ?`,
    [userId],
    (err, result) => {
      if (err) return res.send(err);
      res.json(result);
    }
  );
});

// ================= START SERVER =================
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});