import { ExpenseModel } from '../models/expenseModel.js';
import { IncomeModel } from '../models/incomeModel.js';
import { BudgetModel } from '../models/budgetModel.js';
import { GoalModel } from '../models/goalModel.js';
import { RecurringModel } from '../models/recurringModel.js';

export const InsightService = {
  /**
   * Generate data-driven, constructive, teenager-appropriate financial insights
   * @param {string} userId - Authenticated user UUID
   */
  async generateInsights(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Fetch user data in parallel
    const [expenses, incomeList, budgets, goals, recurring] = await Promise.all([
      ExpenseModel.getAllByUserId(userId),
      IncomeModel.findByUserId(userId),
      BudgetModel.findByUserIdAndPeriod(userId, currentMonth, currentYear),
      GoalModel.findByUserId(userId),
      RecurringModel.findByUserId(userId)
    ]);

    const insights = [];

    // Empty state guidance if teen has no expenses yet
    if (expenses.length === 0) {
      return [
        {
          id: 'ins-welcome',
          type: 'tip',
          category: 'Getting Started',
          title: 'Welcome to your money dashboard!',
          message: 'Start by logging your daily expenses like snacks, bus fare, or lunch.',
          reason: 'Your account is brand new and waiting for its first transaction.',
          action: 'Tap "+ Add Expense" above to see how TeenSpend breaks down your spending.',
          icon: 'Sparkles',
          priority: 'high'
        }
      ];
    }

    // 1. Current Month vs Previous Month Spending Analysis
    const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
    const prevMonthExpenses = expenses.filter(e => e.date.startsWith(prevMonthPrefix));

    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const prevMonthTotal = prevMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 2. Category Share Analysis
    const currentCategoryTotals = {};
    currentMonthExpenses.forEach(e => {
      currentCategoryTotals[e.category] = (currentCategoryTotals[e.category] || 0) + Number(e.amount);
    });

    const prevCategoryTotals = {};
    prevMonthExpenses.forEach(e => {
      prevCategoryTotals[e.category] = (prevCategoryTotals[e.category] || 0) + Number(e.amount);
    });

    // Check largest category share
    if (currentMonthTotal > 0) {
      const sortedCategories = Object.entries(currentCategoryTotals).sort((a, b) => b[1] - a[1]);
      if (sortedCategories.length > 0) {
        const [topCategory, topAmount] = sortedCategories[0];
        const share = Math.round((topAmount / currentMonthTotal) * 100);

        if (share >= 30) {
          insights.push({
            id: `ins-top-cat-${topCategory.toLowerCase()}`,
            type: 'trend',
            category: topCategory,
            title: `${topCategory} makes up ${share}% of your spending this month`,
            message: `${topCategory} is your largest spending category so far ($${topAmount.toFixed(2)} out of $${currentMonthTotal.toFixed(2)}).`,
            reason: `When one category reaches over 30% of total outflow, small tweaks can save significant cash.`,
            action: `You could check if setting a weekly limit for ${topCategory} helps you keep more money for your goals.`,
            icon: 'PieChart',
            priority: 'medium'
          });
        }
      }
    }

    // 3. Category Shift Comparison (e.g. Snacks or Food went up)
    for (const [cat, currentAmt] of Object.entries(currentCategoryTotals)) {
      const prevAmt = prevCategoryTotals[cat] || 0;
      if (prevAmt > 0 && currentAmt > prevAmt * 1.35 && currentAmt - prevAmt >= 10) {
        const increasePct = Math.round(((currentAmt - prevAmt) / prevAmt) * 100);
        insights.push({
          id: `ins-spike-${cat.toLowerCase()}`,
          type: 'warning',
          category: cat,
          title: `Your ${cat} spending increased compared to last month`,
          message: `You have spent $${currentAmt.toFixed(2)} on ${cat} this month, up ${increasePct}% from $${prevAmt.toFixed(2)} last month.`,
          reason: `Higher frequency of smaller purchases often adds up faster than expected.`,
          action: `You could review your recent ${cat} receipts to see if there are items you could skip or swap.`,
          icon: 'TrendingUp',
          priority: 'medium'
        });
      }
    }

    // 4. Budget Utilization Alerts (Gentle, Non-judgmental)
    for (const budget of budgets) {
      const spent = currentCategoryTotals[budget.category] || 0;
      const budgetAmt = Number(budget.amount);
      const pct = budgetAmt > 0 ? Math.round((spent / budgetAmt) * 100) : 0;

      if (pct >= 100) {
        insights.push({
          id: `ins-budget-exceeded-${budget.category.toLowerCase()}`,
          type: 'alert',
          category: budget.category,
          title: `You have reached your ${budget.category} budget`,
          message: `You've spent $${spent.toFixed(2)} against your $${budgetAmt.toFixed(2)} target for this month.`,
          reason: `Budgets are flexible guideposts to help you prioritize your choices for the remainder of the month.`,
          action: `Consider pausing non-essential ${budget.category} purchases until next month, or adjust your budget if your needs changed.`,
          icon: 'AlertCircle',
          priority: 'high'
        });
      } else if (pct >= 80) {
        const remaining = (budgetAmt - spent).toFixed(2);
        insights.push({
          id: `ins-budget-warn-${budget.category.toLowerCase()}`,
          type: 'warning',
          category: budget.category,
          title: `You've used ${pct}% of your ${budget.category} budget`,
          message: `You have $${remaining} left in your ${budget.category} budget for this month.`,
          reason: `Tracking when you cross the 80% mark gives you time to pace your spending before the month ends.`,
          action: `Pacing your spending for the next few days will help you stay within your comfort zone.`,
          icon: 'Gauge',
          priority: 'medium'
        });
      }
    }

    // 5. Recurring Subscriptions Audit
    if (recurring.length > 0) {
      const recurringMonthlyTotal = recurring.reduce((sum, r) => {
        let monthly = Number(r.amount);
        if (r.frequency === 'weekly') monthly *= 4.33;
        if (r.frequency === 'yearly') monthly /= 12;
        return sum + monthly;
      }, 0);

      if (recurringMonthlyTotal > 20) {
        insights.push({
          id: 'ins-subscriptions-audit',
          type: 'suggestion',
          category: 'Subscriptions',
          title: `You have ${recurring.length} active recurring subscriptions`,
          message: `Your subscriptions add up to roughly $${recurringMonthlyTotal.toFixed(2)} every month.`,
          reason: `Digital services and entertainment passes renew automatically in the background.`,
          action: `Review your subscriptions list once a month to ensure you're still enjoying and actively using each one.`,
          icon: 'Repeat',
          priority: 'low'
        });
      }
    }

    // 6. Savings Goals Encouragement
    for (const goal of goals) {
      const current = Number(goal.current_amount);
      const target = Number(goal.target_amount);
      const pct = target > 0 ? Math.round((current / target) * 100) : 0;
      const remaining = (target - current).toFixed(2);

      if (pct >= 50 && pct < 100) {
        insights.push({
          id: `ins-goal-progress-${goal.id}`,
          type: 'success',
          category: 'Savings Goals',
          title: `Awesome progress! You're ${pct}% towards "${goal.name}"`,
          message: `You only have $${remaining} left to reach your goal of $${target.toFixed(2)}.`,
          reason: `Consistently putting aside small amounts keeps you motivated toward big milestones.`,
          action: `Putting aside even $5-$10 from your next allowance will bring you even closer!`,
          icon: 'Target',
          priority: 'low'
        });
      }
    }

    // 7. General Financial Wellness & Teen Advice (if few insights triggered)
    if (insights.length < 3) {
      insights.push({
        id: 'ins-smart-habits',
        type: 'education',
        category: 'Money Habits',
        title: 'The 24-Hour Rule for Teen Purchases',
        message: 'Before buying something that costs more than $20 that isn\'t an absolute need, wait 24 hours.',
        reason: 'Most impulse purchases lose their excitement after a good night\'s sleep.',
        action: 'Try it next time you spot something cool online or at the mall.',
        icon: 'Clock',
        priority: 'low'
      });
    }

    return insights;
  }
};
