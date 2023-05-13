-- Insert data into the "users" table
INSERT INTO users (username, password)
VALUES
  ('Alice1', 'hashed_password1'),
  ('Bob2', 'hashed_password2'),
  ('Charlie3', 'hashed_password3');

-- Insert data into the "transactions" table
INSERT INTO transactions (type, amount, user_id)
VALUES
  ('Withdrawal', 50, 1),
  ('Deposit', 100, 1),
  ('Withdrawal', 20, 1),
  ('Deposit', 75, 2),
  ('Deposit', 200, 2),
  ('Withdrawal', 50, 2),
  ('Withdrawal', 30, 3),
  ('Deposit', 150, 3),
  ('Withdrawal', 10, 3);

