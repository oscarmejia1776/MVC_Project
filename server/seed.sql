-- Insert data into the "users" table
INSERT INTO users (username, password)
VALUES
  ('Alice1', 'hashed_password1'),
  ('Bob2', 'hashed_password2'),
  ('Charlie3', 'hashed_password3');

-- Insert data into the "transactions" table
INSERT INTO transactions (type, amount, user_id)
VALUES
  ('Withdrawal', 50.25, 1),
  ('Deposit', 100.00, 1),
  ('Withdrawal', 20.50, 1),
  ('Deposit', 75.60, 2),
  ('Deposit', 200.00, 2),
  ('Withdrawal', 50.75, 2),
  ('Withdrawal', 30.80, 3),
  ('Deposit', 150.00, 3),
  ('Withdrawal', 10.25, 3);

