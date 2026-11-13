import { Router, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// 1. Get Category Budgets with Current Spent Calculation
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         b.id,
         c.name AS category,
         c.icon,
         b.allocated_amount AS allocated,
         COALESCE(
           (SELECT SUM(t.amount) 
            FROM transactions t 
            WHERE t.user_id = b.user_id 
              AND t.category_id = b.category_id 
              AND t.type = 'expense'
              AND MONTH(t.transaction_date) = ?
              AND YEAR(t.transaction_date) = ?
           ), 0
         ) AS spent
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.month = ? AND b.year = ?`,
      [currentMonth, currentYear, req.userId, currentMonth, currentYear]
    );

    const budgets = rows.map((r) => ({
      id: String(r.id),
      category: r.category,
      icon: r.icon || 'pie-chart',
      allocated: Number(r.allocated),
      spent: Number(r.spent),
    }));

    res.status(200).json({ budgets });
  } catch (error) {
    console.error('Fetch budgets error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

// 2. Set or Update a Category Budget
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category_id, allocated_amount } = req.body;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    if (!category_id || !allocated_amount) {
      return res.status(400).json({ error: 'Category ID and allocated amount are required.' });
    }

    await pool.query(
      `INSERT INTO budgets (user_id, category_id, allocated_amount, month, year)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE allocated_amount = VALUES(allocated_amount)`,
      [req.userId, category_id, allocated_amount, currentMonth, currentYear]
    );

    res.status(200).json({ message: 'Budget updated successfully!' });
  } catch (error) {
    console.error('Save budget error:', error);
    res.status(500).json({ error: 'Failed to set budget.' });
  }
});

export default router;

