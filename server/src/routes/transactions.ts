import { Router, Response } from 'express';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect all transaction routes
router.use(authenticateToken);

// 1. Get All Transactions for the Student
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.id, 
        t.title, 
        t.amount, 
        t.type, 
        t.notes, 
        t.transaction_date, 
        t.created_at,
        c.name AS category,
        c.icon AS categoryIcon
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC, t.id DESC`,
      [req.userId]
    );

    // Format amounts as numbers
    const transactions = rows.map((r) => ({
      id: String(r.id),
      title: r.title,
      amount: Number(r.amount),
      type: r.type,
      category: r.category || 'General',
      categoryIcon: r.categoryIcon || 'wallet',
      date: r.transaction_date,
      notes: r.notes,
    }));

    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
});

// 2. Add New Transaction
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, type, category_name, transaction_date, notes } = req.body;

    if (!title || !amount || !type) {
      return res.status(400).json({ error: 'Title, amount, and type (income/expense) are required.' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    // Find or link category ID (exact or partial match)
    let categoryId = null;
    if (category_name) {
      const [catRows] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM categories WHERE name = ? OR name LIKE ? LIMIT 1',
        [category_name, `%${category_name}%`]
      );
      if (catRows.length > 0) {
        categoryId = catRows[0].id;
      }
    }

    const txDate = transaction_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO transactions (user_id, category_id, amount, type, title, notes, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, categoryId, parsedAmount, type, title.trim(), notes || null, txDate]
    );

    res.status(201).json({
      message: 'Transaction saved successfully!',
      transactionId: result.insertId,
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction.' });
  }
});

// 3. Delete Transaction
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const txId = req.params.id;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [txId, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized.' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction.' });
  }
});

// 4. Financial Summary for Current Month
router.get('/summary', async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         type, 
         SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? 
         AND MONTH(transaction_date) = MONTH(CURRENT_DATE())
         AND YEAR(transaction_date) = YEAR(CURRENT_DATE())
       GROUP BY type`,
      [req.userId]
    );

    let totalIncome = 0;
    let totalExpense = 0;

    for (const r of rows) {
      if (r.type === 'income') totalIncome = Number(r.total);
      if (r.type === 'expense') totalExpense = Number(r.total);
    }

    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
    });
  } catch (error) {
    console.error('Fetch summary error:', error);
    res.status(500).json({ error: 'Failed to compute financial summary.' });
  }
});

export default router;

