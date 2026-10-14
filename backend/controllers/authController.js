import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

const SALT_ROUNDS = 12;

function createAccessToken(user) {
  return jwt.sign(
    { sub: String(user.id) },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "auth-api",
      audience: "auth-client",
    }
  )
  }

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
}

function createMailer() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("Email service is not configured");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message:
          "Name and email are required. Password must be 12–72 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const user = result.rows[0];
    const accessToken = createAccessToken(user);

    return res.status(201).json({
      message: "Registration successful.",
      user: publicUser(user),
      accessToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 255 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Invalid email or password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT id, name, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    const user = result.rows[0];

    // Keep the same public error for unknown emails and wrong passwords.
    const validPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !validPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const accessToken = createAccessToken(user);

    return res.status(200).json({
      message: "Login successful.",
      user: publicUser(user),
      accessToken,
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "User account no longer exists.",
      });
    }

    return res.status(200).json({
      user: publicUser(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      email.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    // Do not disclose whether the account exists.
    if (result.rowCount > 0) {
      const user = result.rows[0];

      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Replace outstanding, unused reset tokens for this user.
      const client = await pool.connect();

      try {
        await client.query("BEGIN");

        await client.query(
          `UPDATE password_reset_tokens
           SET used_at = NOW()
           WHERE user_id = $1 AND used_at IS NULL`,
          [user.id]
        );

        await client.query(
          `INSERT INTO password_reset_tokens
             (user_id, token_hash, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
          [user.id, tokenHash]
        );

        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      const frontendUrl = process.env.FRONTEND_URL;

      if (!frontendUrl) {
        throw new Error("FRONTEND_URL is not configured");
      }

      const resetUrl = new URL("/reset-password", frontendUrl);
      resetUrl.searchParams.set("token", rawToken);

      // Send only the raw token to the user's email.
      const mailer = createMailer();

      await mailer.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset your password",
        text: `Use this link within 15 minutes to reset your password:\n\n${resetUrl.toString()}\n\nIf you did not request this, ignore this email.`,
      });
    }

    return res.status(200).json({
      message:
        "If an account exists for that email, a password reset link will be sent.",
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res, next) {
  const { token, newPassword } = req.body;

  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token) ||
    typeof newPassword !== "string" ||
    newPassword.length < 12 ||
    newPassword.length > 72
  ) {
    return res.status(400).json({
      message: "Invalid token or password. Password must be 12–72 characters.",
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const passwordHash = await bcrypt.hash(
    newPassword,
    SALT_ROUNDS
  );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND expires_at > NOW()
         AND used_at IS NULL
       FOR UPDATE`,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Invalid or expired password reset token.",
      });
    }

    const resetToken = result.rows[0];

    await client.query(
      `UPDATE users
       SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, resetToken.user_id]
    );

    // Invalidate every outstanding reset token for this user.
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = $1 AND used_at IS NULL`,
      [resetToken.user_id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      message: "Password reset successful. Please log in again.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

export {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
};
