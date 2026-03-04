-- Insert users (run in psql or any PostgreSQL client)
-- No extension required. Passwords: Admin@123 and User@123 (bcrypt hashes pre-computed)

-- Admin user (password: Admin@123)
INSERT INTO users (
  id, username, firstname, lastname, email, password,
  "isVerified", role, status, "verificationToken", "verificationTokenExpires",
  "resetToken", "resetTokenExpires", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin',
  'Admin',
  'User',
  'admin@ainexus.com',
  '$2b$10$41L71zEBIgAFavWsCWq3XeHUCCHC1Bv28LjpuW8DDMXDnoiwvInnG',
  true,
  'Admin'::users_role_enum,
  'active'::users_status_enum,
  NULL, NULL, NULL, NULL,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Regular user (password: User@123)
INSERT INTO users (
  id, username, firstname, lastname, email, password,
  "isVerified", role, status, "verificationToken", "verificationTokenExpires",
  "resetToken", "resetTokenExpires", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'user',
  'Test',
  'User',
  'user@ainexus.com',
  '$2b$10$k57VjvxerFw4ZoiakGpdyeGQVMLAnZiTlrD8C9bX2ECt5.UcYjyVm',
  true,
  'User'::users_role_enum,
  'active'::users_status_enum,
  NULL, NULL, NULL, NULL,
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
