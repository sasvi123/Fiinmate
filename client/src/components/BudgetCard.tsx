import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBudget } from '../types/finance';
import { Colors } from '../theme/colors';

interface BudgetCardProps {
  budget: CategoryBudget;
  currency: string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, currency }) => {
  const percent = Math.min(Math.round((budget.spent / budget.allocated) * 100), 100);
  const remaining = budget.allocated - budget.spent;
  const isOver = remaining < 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={[styles.iconWrap, { backgroundColor: `${budget.color}20` }]}>
            <Ionicons name={budget.icon as any} size={18} color={budget.color} />
          </View>
          <Text style={styles.categoryName}>{budget.category}</Text>
        </View>
        <Text style={styles.spentText}>
          {currency}{budget.spent} / <Text style={styles.allocatedText}>{currency}{budget.allocated}</Text>
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.barBg}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percent}%`,
              backgroundColor: isOver
                ? Colors.expense
                : percent > 80
                ? Colors.warning
                : budget.color,
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.statusText, { color: isOver ? Colors.expense : Colors.textSecondary }]}>
          {isOver
            ? `Over budget by ${currency}${Math.abs(remaining)}`
            : `${currency}${remaining} remaining`}
        </Text>
        <Text style={styles.percentText}>{percent}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  spentText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  allocatedText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  barBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

