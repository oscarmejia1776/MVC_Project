import fs from "fs/promises";
import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const server = express();
const PORT = 3001;

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

server.use(express.static("client"));
server.use(express.json());

//////////////////////////////Create New User////////////////////////////////
server.post("/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(422);
    return;
  }

  db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    [username, password]
  ).then((result) => {
    res.send(result.rows[0]).status(201);
  });
});
//////////////////////////Get Users Password////////////////////////////
//Also requesting id so user_id variable can be stored on the front end in order to make transaction requests.
server.get("/users/:username", (req, res) => {
  const username = req.params.username;

  if (!username) {
    res.sendStatus(422);
    return;
  }

  db.query(
    "SELECT id, password, goal FROM users WHERE username = $1",
    [username],
    (error, result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows[0]);
      }
    }
  );
});
//////////////////////////Get ALL Transactions for User//////////////////////
server.get("/transactions/:user_id", (req, res) => {
  const user_id = Number(req.params.user_id);

  if (Number.isNaN(user_id)) {
    res.sendStatus(422);
    return;
  }

  db.query(
    "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
    [user_id],
    (error, result) => {
      if (result.rows.length === 0) {
        res.sendStatus(404);
      } else {
        res.send(result.rows);
      }
    }
  );
});
///////////////////////////Post New Transaction/////////////////////////
server.post("/transactions", (req, res) => {
  const type = req.body.type;
  const amount = Number(req.body.amount);
  const user_id = Number(req.body.user_id);

  if (!type || !amount || !user_id) {
    res.status(422);
    return;
  }

  db.query(
    `INSERT INTO transactions (type, amount, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [type, amount, user_id]
  ).then((result) => {
    res.send(result.rows[0]).status(201);
  });
});
//////////////////////////Delete Transaction//////////////////////////////
server.delete("/transactions/:id", (req, res) => {
  const transactions_id = Number(req.params.id);

  if (Number.isNaN(transactions_id)) {
    res.status(422);
    return;
  }

  db.query(
    `DELETE FROM transactions
     WHERE id = $1
     RETURNING *`,
    [transactions_id]
  ).then((result) => {
    if (result.rows.length === 0) {
      res.status(404);
    } else {
      res.send(result.rows[0]);
    }
  });
});
//////////////////////Update(PATCH) Goal Amount////////////////////////////////////
server.patch("/users/:id", (req, res) => {
  const user_id = Number(req.params.id);
  const goal = Number(req.body.goal);

  if (Number.isNaN(user_id) || Number.isNaN(goal)) {
    res.sendStatus(422);
    return;
  }

  db.query(
    `UPDATE users
     SET goal = $1
     WHERE id = $2
     RETURNING *`,
    [goal, user_id]
  ).then((result) => {
    if (result.rows.length === 0) {
      res.sendStatus(404);
    } else {
      res.send(result.rows[0]);
    }
  });
});
///////////////////////Listening On Port////////////////////////////////////
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
