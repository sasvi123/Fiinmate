import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

interface QuickActionsProps {
  onAddExpense: () => void;
  onAddIncome: () => void;
  onViewBudgets: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddExpense,
  onAddIncome,
  onViewBudgets,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
        onPress={onAddExpense}
        activeOpacity={0.8}
      >
        <Ionicons name="remove-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.actionTextPrimary}>Expense</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={onAddIncome}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={20} color={Colors.income} />
        <Text style={[styles.actionTextSecondary, { color: Colors.income }]}>Income</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={onViewBudgets}
        activeOpacity={0.8}
      >
        <Ionicons name="pie-chart-outline" size={20} color={Colors.textPrimary} />
        <Text style={styles.actionTextSecondary}>Budgets</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginVertical: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionTextSecondary: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
});

