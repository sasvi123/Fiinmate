import { StudentFinancialProfile, Transaction, CategoryBudget } from '../types/finance';
import { Colors } from '../theme/colors';

export const initialProfile: StudentFinancialProfile = {
  name: 'Alex Rivera',
  currency: '$',
  totalBalance: 642.50,
  monthlyBudget: 800.00,
  totalIncomeThisMonth: 950.00,
  totalExpenseThisMonth: 420.00,
};

export const initialBudgets: CategoryBudget[] = [
  {
    id: 'b1',
    category: 'Food & Dining',
    allocated: 250,
    spent: 165,
    icon: 'restaurant',
    color: Colors.accents.food,
  },
  {
    id: 'b2',
    category: 'Tuition & Books',
    allocated: 150,
    spent: 120,
    icon: 'book',
    color: Colors.accents.books,
  },
  {
    id: 'b3',
    category: 'Transportation',
    allocated: 100,
    spent: 45,
    icon: 'bus',
    color: Colors.accents.transit,
  },
  {
    id: 'b4',
    category: 'Entertainment & Social',
    allocated: 120,
    spent: 90,
    icon: 'game-controller',
    color: Colors.accents.entertainment,
  },
];

export const initialTransactions: Transaction[] = [
  {
    id: 't1',
    title: 'University Bookstore',
    amount: 65.00,
    type: 'expense',
    category: 'Tuition & Books',
    categoryIcon: 'book',
    categoryColor: Colors.accents.books,
    date: 'Today, 2:15 PM',
    notes: 'Algorithms & Data Structures textbook',
  },
  {
    id: 't2',
    title: 'Campus Cafeteria Lunch',
    amount: 12.50,
    type: 'expense',
    category: 'Food & Dining',
    categoryIcon: 'restaurant',
    categoryColor: Colors.accents.food,
    date: 'Today, 12:30 PM',
  },
  {
    id: 't3',
    title: 'Monthly Allowance from Parents',
    amount: 400.00,
    type: 'income',
    category: 'Allowance / Pocket Money',
    categoryIcon: 'cash',
    categoryColor: Colors.accents.allowance,
    date: 'Yesterday',
  },
  {
    id: 't4',
    title: 'Metro Monthly Pass',
    amount: 45.00,
    type: 'expense',
    category: 'Transportation',
    categoryIcon: 'bus',
    categoryColor: Colors.accents.transit,
    date: 'Nov 10',
  },
  {
    id: 't5',
    title: 'Campus Tutoring Paycheck',
    amount: 150.00,
    type: 'income',
    category: 'Part-time Job',
    categoryIcon: 'briefcase',
    categoryColor: Colors.accents.job,
    date: 'Nov 08',
  },
];

