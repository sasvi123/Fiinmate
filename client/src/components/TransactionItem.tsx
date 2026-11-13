import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/finance';
import { Colors } from '../theme/colors';

interface TransactionItemProps {
  item: Transaction;
  currency: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ item, currency }) => {
  const isIncome = item.type === 'income';

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.categoryColor}20` }]}>
        <Ionicons
          name={item.categoryIcon as any}
          size={20}
          color={item.categoryColor || Colors.primary}
        />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtext}>
          {item.category} • {item.date}
        </Text>
      </View>

      <Text
        style={[
          styles.amount,
          { color: isIncome ? Colors.income : Colors.textPrimary },
        ]}
      >
        {isIncome ? '+' : '-'}
        {currency}
        {item.amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  subtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
});

