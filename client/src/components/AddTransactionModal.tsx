import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, TransactionType } from '../types/finance';
import { Colors } from '../theme/colors';

interface AddTransactionModalProps {
  visible: boolean;
  defaultType?: TransactionType;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  currency: string;
}

const CATEGORIES = [
  { name: 'Food & Dining', icon: 'restaurant', color: Colors.accents.food, type: 'expense' },
  { name: 'Tuition & Books', icon: 'book', color: Colors.accents.books, type: 'expense' },
  { name: 'Transportation', icon: 'bus', color: Colors.accents.transit, type: 'expense' },
  { name: 'Entertainment & Social', icon: 'game-controller', color: Colors.accents.entertainment, type: 'expense' },
  { name: 'Housing & Rent', icon: 'home', color: Colors.accents.rent, type: 'expense' },
  { name: 'Groceries', icon: 'cart', color: Colors.accents.groceries, type: 'expense' },
  { name: 'Allowance / Pocket Money', icon: 'cash', color: Colors.accents.allowance, type: 'income' },
  { name: 'Part-time Job / Salary', icon: 'briefcase', color: Colors.accents.job, type: 'income' },
  { name: 'Scholarship / Financial Aid', icon: 'school', color: Colors.primary, type: 'income' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  defaultType = 'expense',
  onClose,
  onAddTransaction,
  currency,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!title.trim()) {
      alert('Please enter a title (e.g. Lunch, Textbook)');
      return;
    }

    onAddTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: selectedCategory.name,
      categoryIcon: selectedCategory.icon,
      categoryColor: selectedCategory.color,
      date: 'Just now',
    });

    // Reset Form
    setAmount('');
    setTitle('');
    onClose();
  };

  const filteredCategories = CATEGORIES.filter((c) => c.type === type);

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>New Transaction</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Type Toggle: Expense vs Income */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'expense' && { backgroundColor: Colors.expense },
              ]}
              onPress={() => {
                setType('expense');
                setSelectedCategory(CATEGORIES[0]);
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'expense' && styles.typeBtnTextActive,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === 'income' && { backgroundColor: Colors.income },
              ]}
              onPress={() => {
                setType('income');
                setSelectedCategory(CATEGORIES[6]);
              }}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  type === 'income' && styles.typeBtnTextActive,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountInputWrap}>
            <Text style={styles.currencyPrefix}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>

          {/* Title Input */}
          <Text style={styles.inputLabel}>Title / Description</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Textbook, Pizza with roommates, Tutoring"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          {/* Category Selector */}
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategory.name === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryChip,
                    isSelected && {
                      backgroundColor: `${cat.color}25`,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? cat.color : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && { color: cat.color, fontWeight: '700' },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: type === 'expense' ? Colors.expense : Colors.income },
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 120,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 18,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 22,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  submitBtn: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

