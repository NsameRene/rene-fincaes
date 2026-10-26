import { Transaction, Category, Budget, FinancialInsight } from '../types';

export function calculateRuleBasedInsights(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  targetDate: Date = new Date()
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  if (transactions.length === 0) return insights;

  const y = targetDate.getFullYear();
  const m = targetDate.getMonth(); // 0-indexed
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const currentDay = Math.min(targetDate.getDate(), daysInMonth);

  const curMonthPrefix = `${y}-${String(m + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(y, m - 1, 1);
  const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const curTxs = transactions.filter(t => t.date.startsWith(curMonthPrefix));
  const prevTxs = transactions.filter(t => t.date.startsWith(prevMonthPrefix));

  const curIncome = curTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const curExpense = curTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // 1. Largest Expense Category this month
  const categoryMap = new Map<string, string>();
  categories.forEach(c => categoryMap.set(c.id, c.name));

  const catExpenses: Record<string, number> = {};
  curTxs
    .filter(t => t.type === 'expense' && t.category_id)
    .forEach(t => {
      const cid = t.category_id!;
      catExpenses[cid] = (catExpenses[cid] || 0) + t.amount;
    });

  let largestCatId: string | null = null;
  let largestCatAmount = 0;
  for (const [cid, amt] of Object.entries(catExpenses)) {
    if (amt > largestCatAmount) {
      largestCatAmount = amt;
      largestCatId = cid;
    }
  }

  if (largestCatId && largestCatAmount > 0 && curExpense > 0) {
    const catName = categoryMap.get(largestCatId) || 'Uncategorized';
    const pctOfTotal = Math.round((largestCatAmount / curExpense) * 100);
    insights.push({
      id: 'largest_category',
      type: 'info',
      title: 'Top Expenditure Category',
      description: `${catName} represents ${pctOfTotal}% of your total expenditure this month.`,
      category_name: catName,
    });
  }

  // 2. Month-over-month category spending changes
  if (prevTxs.length > 0) {
    const prevCatExpenses: Record<string, number> = {};
    prevTxs
      .filter(t => t.type === 'expense' && t.category_id)
      .forEach(t => {
        const cid = t.category_id!;
        prevCatExpenses[cid] = (prevCatExpenses[cid] || 0) + t.amount;
      });

    for (const [cid, curAmt] of Object.entries(catExpenses)) {
      const prevAmt = prevCatExpenses[cid] || 0;
      if (prevAmt > 0 && curAmt > 0) {
        const diffPct = Math.round(((curAmt - prevAmt) / prevAmt) * 100);
        const catName = categoryMap.get(cid) || 'Category';

        if (diffPct >= 15) {
          insights.push({
            id: `diff_${cid}`,
            type: 'warning',
            title: `${catName} Spending Surge`,
            description: `${catName} spending is ${diffPct}% higher than last month.`,
            change_pct: diffPct,
            category_name: catName,
          });
          break; // only report one significant surge to keep dashboard clean
        } else if (diffPct <= -20) {
          insights.push({
            id: `diff_${cid}`,
            type: 'positive',
            title: `${catName} Savings`,
            description: `You spent ${Math.abs(diffPct)}% less on ${catName} compared to last month. Great job!`,
            change_pct: diffPct,
            category_name: catName,
          });
          break;
        }
      }
    }
  }

  // 3. Overall Monthly Budget Projection
  const overallBudget = budgets.find(b => b.category_id === null && b.period === 'monthly');
  if (overallBudget && overallBudget.amount > 0) {
    const spentPct = (curExpense / overallBudget.amount) * 100;
    const projectedSpent = currentDay > 0 ? (curExpense / currentDay) * daysInMonth : curExpense;

    if (curExpense >= overallBudget.amount) {
      insights.push({
        id: 'budget_exceeded',
        type: 'warning',
        title: 'Monthly Budget Limit Exceeded',
        description: `You have spent 100% of your ${overallBudget.amount.toLocaleString()} budget with ${daysInMonth - currentDay} days remaining.`,
      });
    } else if (projectedSpent > overallBudget.amount && currentDay >= 5) {
      insights.push({
        id: 'budget_pace_warning',
        type: 'warning',
        title: 'Budget Pace Alert',
        description: `At your current average daily spending, you are projected to reach ${Math.round((projectedSpent / overallBudget.amount) * 100)}% of your monthly budget.`,
      });
    } else if (spentPct < 50 && currentDay >= 20) {
      insights.push({
        id: 'budget_healthy',
        type: 'positive',
        title: 'Healthy Budget Buffer',
        description: `You have used only ${Math.round(spentPct)}% of your monthly budget late into the month.`,
      });
    }
  }

  // 4. Positive Cash Flow vs Deficit
  if (curIncome > 0 && curExpense > 0) {
    const netFlow = curIncome - curExpense;
    if (netFlow > 0) {
      const savingsRate = Math.round((netFlow / curIncome) * 100);
      if (savingsRate >= 20) {
        insights.push({
          id: 'strong_cashflow',
          type: 'positive',
          title: 'Strong Positive Cash Flow',
          description: `You are saving ${savingsRate}% of your income this month (${netFlow.toLocaleString()} net surplus).`,
        });
      }
    } else if (netFlow < 0) {
      insights.push({
        id: 'negative_cashflow',
        type: 'warning',
        title: 'Expenditure Exceeds Income',
        description: `Your spending this month is ${Math.abs(netFlow).toLocaleString()} more than recorded income.`,
      });
    }
  }

  return insights;
}
