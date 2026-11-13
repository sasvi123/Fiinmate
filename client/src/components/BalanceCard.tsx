import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudentFinancialProfile } from '../types/finance';
import { Colors } from '../theme/colors';

interface BalanceCardProps {
  profile: StudentFinancialProfile;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ profile }) => {
  const budgetPercent = Math.min(
    Math.round((profile.totalExpenseThisMonth / profile.monthlyBudget) * 100),
    100
  );
  const remainingBudget = profile.monthlyBudget - profile.totalExpenseThisMonth;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.label}>Available Balance</Text>
          <Text style={styles.balance}>
            {profile.currency}
            {profile.totalBalance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.walletBadge}>
          <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
        </View>
      </View>

      {/* Monthly Budget Progress Section */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetLabels}>
          <Text style={styles.budgetTitle}>Monthly Student Budget</Text>
          <Text style={styles.budgetNumbers}>
            {profile.currency}{profile.totalExpenseThisMonth.toFixed(0)} / {profile.currency}{profile.monthlyBudget.toFixed(0)}
          </Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${budgetPercent}%`,
                backgroundColor:
                  budgetPercent > 90
                    ? Colors.expense
                    : budgetPercent > 75
                    ? Colors.warning
                    : Colors.primary,
              },
            ]}
          />
        </View>

        <Text style={styles.remainingText}>
          {remainingBudget >= 0
            ? `You have ${profile.currency}${remainingBudget.toFixed(2)} safe to spend this month.`
            : `⚠️ You are ${profile.currency}${Math.abs(remainingBudget).toFixed(2)} over budget!`}
        </Text>
      </View>

      {/* Income vs Expenses Mini Counters */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: Colors.incomeLight }]}>
            <Ionicons name="arrow-down" size={16} color={Colors.income} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={[styles.statValue, { color: Colors.income }]}>
              +{profile.currency}{profile.totalIncomeThisMonth.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.statIconBadge, { backgroundColor: Colors.expenseLight }]}>
            <Ionicons name="arrow-up" size={16} color={Colors.expense} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={[styles.statValue, { color: Colors.expense }]}>
              -{profile.currency}{profile.totalExpenseThisMonth.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  walletBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  budgetNumbers: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    justifyContent: 'space-between',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  statIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
});

