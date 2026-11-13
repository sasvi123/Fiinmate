import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Student Registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, monthly_budget = 500.0, currency = '$' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if email already registered
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into Aiven MySQL
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash, monthly_budget, currency) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), passwordHash, monthly_budget, currency]
    );

    const userId = result.insertId;
    const secret = process.env.JWT_SECRET || 'finwise_secret_key';
    const token = jwt.sign({ id: userId, email }, secret, { expiresIn: '30d' });

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: userId,
        name,
        email,
        monthly_budget,
        currency,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Student Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, monthly_budget, currency FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const secret = process.env.JWT_SECRET || 'finwise_secret_key';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '30d' });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthly_budget: Number(user.monthly_budget),
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current User Profile & Overview
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, monthly_budget, currency, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const user = rows[0];
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthly_budget: Number(user.monthly_budget),
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
});

export default router;

