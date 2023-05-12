DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;

-- Create the "users" table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Create the "transactions" table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  amount MONEY NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);





