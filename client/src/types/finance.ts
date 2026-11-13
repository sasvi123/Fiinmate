export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  date: string;
  notes?: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  icon: string;
  color: string;
}

export interface StudentFinancialProfile {
  name: string;
  currency: string;
  totalBalance: number;
  monthlyBudget: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
}

