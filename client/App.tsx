import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from './src/theme/colors';
import {
  initialProfile,
  initialBudgets,
  initialTransactions,
} from './src/data/mockData';
import { Transaction, TransactionType, CategoryBudget } from './src/types/finance';
import { BalanceCard } from './src/components/BalanceCard';
import { QuickActions } from './src/components/QuickActions';
import { TransactionItem } from './src/components/TransactionItem';
import { BudgetCard } from './src/components/BudgetCard';
import { AddTransactionModal } from './src/components/AddTransactionModal';
import { AuthScreen } from './src/screens/AuthScreen';
import { authApi, transactionsApi, budgetsApi, setAuthToken } from './src/services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    monthly_budget: number;
    currency: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets'>('dashboard');
  const [profile, setProfile] = useState(initialProfile);
  const [budgets, setBudgets] = useState<CategoryBudget[]>(initialBudgets);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');

  // Search & Filter State for Transactions Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Fetch real data for current user
  const fetchUserData = async () => {
    try {
      const txData = await transactionsApi.getAll();
      if (txData && txData.transactions) {
        const mappedTx: Transaction[] = txData.transactions.map((t) => {
          let catColor = Colors.accents.food;
          if (t.category.includes('Books')) catColor = Colors.accents.books;
          else if (t.category.includes('Transit') || t.category.includes('Transport')) catColor = Colors.accents.transit;
          else if (t.category.includes('Allowance')) catColor = Colors.accents.allowance;
          else if (t.category.includes('Job') || t.category.includes('Salary')) catColor = Colors.accents.job;

          return {
            id: String(t.id),
            title: t.title,
            amount: Number(t.amount),
            type: t.type as TransactionType,
            category: t.category,
            categoryIcon: t.categoryIcon || 'wallet',
            categoryColor: catColor,
            date: t.date ? new Date(t.date).toLocaleDateString() : 'Recent',
            notes: t.notes,
          };
        });
        setTransactions(mappedTx);

        const summary = await transactionsApi.getSummary();
        const baseBudget = currentUser?.monthly_budget || 500;
        setProfile((prev) => ({
          ...prev,
          totalIncomeThisMonth: summary.totalIncome,
          totalExpenseThisMonth: summary.totalExpense,
          totalBalance: baseBudget + summary.netBalance,
        }));
      }
      setIsCloudSynced(true);
    } catch (err) {
      console.log('Error fetching user transactions:', err);
      setIsCloudSynced(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleOpenAdd = (type: TransactionType) => {
    setModalDefaultType(type);
    setModalVisible(true);
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const tempId = `tx_${Date.now()}`;
    const optimisticTx: Transaction = {
      ...newTx,
      id: tempId,
    };

    setTransactions((prev) => [optimisticTx, ...prev]);

    if (newTx.type === 'expense') {
      setProfile((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance - newTx.amount,
        totalExpenseThisMonth: prev.totalExpenseThisMonth + newTx.amount,
      }));

      setBudgets((prev) =>
        prev.map((b) =>
          b.category.toLowerCase().includes(newTx.category.toLowerCase()) ||
          newTx.category.toLowerCase().includes(b.category.toLowerCase())
            ? { ...b, spent: b.spent + newTx.amount }
            : b
        )
      );
    } else {
      setProfile((prev) => ({
        ...prev,
        totalBalance: prev.totalBalance + newTx.amount,
        totalIncomeThisMonth: prev.totalIncomeThisMonth + newTx.amount,
      }));
    }

    try {
      await transactionsApi.create({
        title: newTx.title,
        amount: newTx.amount,
        type: newTx.type,
        category_name: newTx.category,
        notes: newTx.notes,
      });
      setIsCloudSynced(true);
    } catch (err) {
      console.warn('Could not save to database immediately:', err);
    }
  };

  // If student is not logged in, show Auth / New Member Screen
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <AuthScreen
          onSuccess={(user) => {
            setCurrentUser(user);
            setProfile({
              name: user.name,
              currency: user.currency,
              totalBalance: user.monthly_budget,
              monthlyBudget: user.monthly_budget,
              totalIncomeThisMonth: 0,
              totalExpenseThisMonth: 0,
            });
            setTransactions([]);
            fetchUserData();
          }}
          onSkipToDemo={() => {
            setCurrentUser({
              name: 'Alex Rivera (Demo)',
              email: 'demo@finwise.edu',
              monthly_budget: 800,
              currency: '$',
            });
            setProfile(initialProfile);
            setTransactions(initialTransactions);
            setBudgets(initialBudgets);
          }}
        />
      </SafeAreaView>
    );
  }

  // Filter transactions for Transactions screen
  const filteredTransactions = transactions.filter((tx) => {
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    const matchesQuery =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>FinWise</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>STUDENT</Text>
            </View>
            <View
              style={[
                styles.syncBadge,
                { backgroundColor: isCloudSynced ? '#DCFCE7' : '#F1F5F9' },
              ]}
            >
              <Text
                style={[
                  styles.syncBadgeText,
                  { color: isCloudSynced ? '#16A34A' : '#64748B' },
                ]}
              >
                {isCloudSynced ? '● Cloud Synced' : '○ Local Demo'}
              </Text>
            </View>
          </View>
          <Text style={styles.greeting}>Hey, {profile.name} 👋</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.userProfileBtn}
            onPress={() => {
              Alert.alert(
                'Student Profile',
                `Signed in as: ${currentUser.email}`,
                [
                  {
                    text: 'Sign Out / Switch Member',
                    style: 'destructive',
                    onPress: () => {
                      setAuthToken(null);
                      setCurrentUser(null);
                    },
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <Ionicons name="person-circle-outline" size={30} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButtonCircle}
            onPress={() => handleOpenAdd('expense')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'dashboard' && (
          <>
            {/* Primary Balance & Monthly Budget Card */}
            <BalanceCard profile={profile} />

            {/* Quick Action Buttons */}
            <QuickActions
              onAddExpense={() => handleOpenAdd('expense')}
              onAddIncome={() => handleOpenAdd('income')}
              onViewBudgets={() => setActiveTab('budgets')}
            />

            {/* AI Advisor Preview Notice (Phase 2 Roadmap) */}
            <View style={styles.aiBanner}>
              <View style={styles.aiIconBadge}>
                <Ionicons name="sparkles" size={18} color="#6366F1" />
              </View>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiTitle}>AI Student Financial Coach (Phase 2)</Text>
                <Text style={styles.aiSubtitle}>
                  Track your daily expenses now to unlock smart spending alerts and meal-plan tips!
                </Text>
              </View>
            </View>

            {/* Category Budgets Snapshot */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Category Budgets</Text>
              <TouchableOpacity onPress={() => setActiveTab('budgets')}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              {budgets.slice(0, 2).map((budget) => (
                <BudgetCard key={budget.id} budget={budget} currency={profile.currency} />
              ))}
            </View>

            {/* Recent Transactions Snapshot */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setActiveTab('transactions')}>
                <Text style={styles.sectionLink}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionContent}>
              {transactions.slice(0, 4).map((tx) => (
                <TransactionItem key={tx.id} item={tx} currency={profile.currency} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'transactions' && (
          <View style={styles.sectionContent}>
            <Text style={styles.screenHeading}>All Transactions</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search food, rent, books..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['all', 'expense', 'income'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    filterType === type && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterType(type)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterType === type && styles.filterChipTextActive,
                    ]}
                  >
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No transactions found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filter</Text>
              </View>
            ) : (
              filteredTransactions.map((tx) => (
                <TransactionItem key={tx.id} item={tx} currency={profile.currency} />
              ))
            )}
          </View>
        )}

        {activeTab === 'budgets' && (
          <View style={styles.sectionContent}>
            <Text style={styles.screenHeading}>Monthly Student Budgets</Text>
            <Text style={styles.screenSubheading}>
              Set limits for essentials like food and transport so you don't run out before month-end.
            </Text>

            {budgets.map((b) => (
              <BudgetCard key={b.id} budget={b} currency={profile.currency} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'dashboard' ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'dashboard' && styles.tabLabelActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('transactions')}
        >
          <Ionicons
            name={activeTab === 'transactions' ? 'receipt' : 'receipt-outline'}
            size={22}
            color={activeTab === 'transactions' ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'transactions' && styles.tabLabelActive,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('budgets')}
        >
          <Ionicons
            name={activeTab === 'budgets' ? 'pie-chart' : 'pie-chart-outline'}
            size={22}
            color={activeTab === 'budgets' ? Colors.primary : Colors.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'budgets' && styles.tabLabelActive,
            ]}
          >
            Budgets
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={modalVisible}
        defaultType={modalDefaultType}
        currency={profile.currency}
        onClose={() => setModalVisible(false)}
        onAddTransaction={handleAddTransaction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userProfileBtn: {
    padding: 4,
  },
  addButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 12,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: 2,
  },
  aiSubtitle: {
    fontSize: 11,
    color: '#4F46E5',
    lineHeight: 16,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  screenSubheading: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' ? 38 : 24,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 46,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
