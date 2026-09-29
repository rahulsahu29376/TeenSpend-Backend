import { ExpenseModel } from '../models/expenseModel.js';
import { IncomeModel } from '../models/incomeModel.js';
import { BudgetModel } from '../models/budgetModel.js';
import { GoalModel } from '../models/goalModel.js';
import { RecurringModel } from '../models/recurringModel.js';
import { CATEGORY_COLORS } from '../utils/constants.js';

export const AnalyticsService = {
  /**
   * Calculate complete consolidated dashboard statistics for a teen user
   */
  async getDashboardData(userId) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch user datasets concurrently
    const [expenses, incomeList, budgets, goals, recurring] = await Promise.all([
      ExpenseModel.getAllByUserId(userId),
      IncomeModel.findByUserId(userId),
      BudgetModel.findByUserIdAndPeriod(userId, currentMonth, currentYear),
      GoalModel.findByUserId(userId),
      RecurringModel.findByUserId(userId)
    ]);

    // 1. Overall Balance, Income, Expense Calculations
    const totalIncome = incomeList.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const currentBalance = totalIncome - totalExpenses;

    // Filter current month expenses
    const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
    const currentMonthSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const currentMonthIncomeList = incomeList.filter(i => i.date.startsWith(currentMonthPrefix));
    const currentMonthIncome = currentMonthIncomeList.reduce((sum, i) => sum + Number(i.amount), 0);

    // 2. Savings Progress
    const totalSavings = goals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0);
    const totalSavingsTarget = goals.reduce((sum, g) => sum + Number(g.target_amount || 0), 0);
    const savingsPercentage = totalSavingsTarget > 0 ? Math.min(100, Math.round((totalSavings / totalSavingsTarget) * 100)) : 0;

    // 3. Category Breakdown (Current Month)
    const categoryMap = {};
    currentMonthExpenses.forEach(e => {
      const cat = e.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, amount]) => {
        const percentage = currentMonthSpent > 0 ? Number(((amount / currentMonthSpent) * 100).toFixed(1)) : 0;
        return {
          name,
          amount: Number(amount.toFixed(2)),
          percentage,
          color: CATEGORY_COLORS[name] || '#6366F1'
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 4. Monthly Trend (Past 6 Months)
    const monthlyTrend = this.calculateMonthlyTrend(expenses, incomeList);

    // 5. Budget Progress vs Actual Spending
    const budgetProgress = budgets.map(b => {
      const spent = categoryMap[b.category] || 0;
      const budgetAmount = Number(b.amount);
      const percentage = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(1)) : 0;
      const remaining = Number((budgetAmount - spent).toFixed(2));

      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        spent: Number(spent.toFixed(2)),
        remaining,
        percentage,
        isWarning: percentage >= 80 && percentage < 100,
        isExceeded: percentage >= 100,
        color: CATEGORY_COLORS[b.category] || '#6366F1'
      };
    });

    // 6. Recent Expenses (top 6)
    const recentExpenses = expenses.slice(0, 6);

    // 7. Recurring Expenses total
    const recurringMonthlyTotal = recurring.reduce((sum, r) => {
      let monthlyEquivalent = Number(r.amount);
      if (r.frequency === 'weekly') monthlyEquivalent = monthlyEquivalent * 4.33;
      if (r.frequency === 'yearly') monthlyEquivalent = monthlyEquivalent / 12;
      return sum + monthlyEquivalent;
    }, 0);

    return {
      summary: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        currentBalance: Number(currentBalance.toFixed(2)),
        currentMonthIncome: Number(currentMonthIncome.toFixed(2)),
        currentMonthSpent: Number(currentMonthSpent.toFixed(2)),
        totalSavings: Number(totalSavings.toFixed(2)),
        savingsPercentage,
        recurringMonthlyTotal: Number(recurringMonthlyTotal.toFixed(2))
      },
      categoryBreakdown,
      monthlyTrend,
      budgetProgress,
      recentExpenses,
      goalsSummary: goals.map(g => ({
        id: g.id,
        name: g.name,
        target_amount: Number(g.target_amount),
        current_amount: Number(g.current_amount),
        remaining: Math.max(0, Number((g.target_amount - g.current_amount).toFixed(2))),
        percentage: Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)),
        target_date: g.target_date
      }))
    };
  },

  /**
   * Helper: Calculate monthly income and spending trend for the last 6 months
   */
  calculateMonthlyTrend(expenses, incomeList) {
    const trend = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const monthPrefix = `${year}-${String(monthNum).padStart(2, '0')}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const monthExpenses = expenses
        .filter(e => e.date.startsWith(monthPrefix))
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const monthIncome = incomeList
        .filter(item => item.date.startsWith(monthPrefix))
        .reduce((sum, item) => sum + Number(item.amount), 0);

      trend.push({
        month: monthLabel,
        period: monthPrefix,
        expenses: Number(monthExpenses.toFixed(2)),
        income: Number(monthIncome.toFixed(2)),
        savings: Number(Math.max(0, monthIncome - monthExpenses).toFixed(2))
      });
    }

    return trend;
  },

  /**
   * Category spending breakdown
   */
  async getCategoryBreakdown(userId, month = null, year = null) {
    const expenses = await ExpenseModel.getAllByUserId(userId);
    let filtered = expenses;

    if (month && year) {
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      filtered = expenses.filter(e => e.date.startsWith(prefix));
    }

    const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
    const categoryMap = {};

    filtered.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
    });

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: total > 0 ? Number(((amount / total) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[category] || '#6366F1'
    })).sort((a, b) => b.amount - a.amount);
  }
};
