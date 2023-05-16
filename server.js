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
  const goal = Number(req.body.goal);

  if (!username || !password || isNaN(goal)) {
    res.status(422).end();
    return;
  }

  db.query("SELECT username FROM users WHERE username = $1", [username])
    .then((existingUser) => {
      if (existingUser.rows.length === 0) {
        return db.query(
          `INSERT INTO users (username, password, goal)
         VALUES ($1, $2, $3)
         RETURNING *`,
          [username, password, goal]
        );
      } else {
        res.status(422).send("Username Already Taken");
        throw new Error("Username Already Taken");
      }
    })
    .then((newUser) => {
      res.status(201).send(newUser.rows[0]);
    })
    .catch((error) => {
      console.error("Error executing database query:", error);
      if (!res.headersSent) {
        res.sendStatus(500);
      }
    });
});

//////////////////////////Compare Users Password////////////////////////////
//Also requesting id so user_id variable can be stored on the front end in order to make transaction requests.
// Get Users Password and compare on the backend
server.post("/users/:username", (req, res) => {
  const username = req.params.username;
  const password = req.body.password;

  if (!username || !password) {
    res.sendStatus(422);
    return;
  }

  db.query(
    "SELECT id, password, goal FROM users WHERE username = $1",
    [username],
    (error, result) => {
      if (result.rows.length === 0) {
        res
          .status(404)
          .send("Username Does Not Exist Please Signup or Try Again");
      } else {
        const storedPassword = result.rows[0].password;
        const isAuthenticated = password === storedPassword;

        res.send({
          isAuthenticated,
          id: result.rows[0].id,
          goal: result.rows[0].goal,
        });
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
    "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date ASC",
    [user_id],
    (error, result) => {
      res.send(result.rows);
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
