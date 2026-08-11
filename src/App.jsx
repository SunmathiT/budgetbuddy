import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import './App.css'

const COLORS = [
  '#7c3aed',
  '#db2777',
  '#2563eb',
  '#f97316',
  '#16a34a',
  '#eab308',
  '#64748b',
]

function App() {
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem('expenses')) || []
  })

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [budget, setBudget] = useState(
    () => localStorage.getItem('budget') || '10000'
  )
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('budget', budget)
  }, [budget])

  const monthlyExpenses = expenses.filter((expense) =>
    expense.date?.startsWith(selectedMonth)
  )

  const totalSpent = monthlyExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  )

  const remaining = Number(budget) - totalSpent

  const budgetPercentage =
    Number(budget) > 0
      ? Math.min(Math.round((totalSpent / Number(budget)) * 100), 100)
      : 0

  const categoryData = Object.values(
    monthlyExpenses.reduce((data, expense) => {
      if (!data[expense.category]) {
        data[expense.category] = {
          name: expense.category,
          value: 0,
        }
      }

      data[expense.category].value += Number(expense.amount)
      return data
    }, {})
  )

  const topCategory =
    categoryData.length > 0
      ? categoryData.reduce((highest, item) =>
          item.value > highest.value ? item : highest
        )
      : null

  const filteredExpenses = monthlyExpenses.filter((expense) => {
    const matchesCategory =
      filterCategory === 'All' || expense.category === filterCategory

    const searchText = `${expense.category} ${expense.note}`.toLowerCase()
    const matchesSearch = searchText.includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  function resetForm() {
    setAmount('')
    setCategory('Food')
    setNote('')
    setDate(new Date().toISOString().split('T')[0])
    setEditingId(null)
  }

  function addOrUpdateExpense(event) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const expenseData = {
      amount,
      category,
      note,
      date,
    }

    if (editingId) {
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingId ? { ...expense, ...expenseData } : expense
        )
      )
    } else {
      setExpenses([{ id: Date.now(), ...expenseData }, ...expenses])
    }

    resetForm()
  }

  function editExpense(expense) {
    setAmount(expense.amount)
    setCategory(expense.category)
    setNote(expense.note)
    setDate(expense.date)
    setEditingId(expense.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  function clearAllExpenses() {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete all expenses?'
    )

    if (shouldDelete) {
      setExpenses([])
    }
  }

  return (
    <main className="app">
      <header>
        <h1>💰 BudgetBuddy</h1>
        <p>Track your daily expenses easily</p>
      </header>

      <section className="summary">
        <div className="card">
          <p>Monthly Budget</p>
          <h2>₹{budget || 0}</h2>
        </div>

        <div className="card">
          <p>Total Spent</p>
          <h2>₹{totalSpent}</h2>
        </div>

        <div className={`card ${remaining < 0 ? 'danger' : 'success'}`}>
          <p>Remaining</p>
          <h2>₹{remaining}</h2>
        </div>
      </section>

      <section className="progress-section">
        <p>Budget Used: {budgetPercentage}%</p>
        <div className="progress-track">
          <div
            className={`progress-fill ${remaining < 0 ? 'over-budget' : ''}`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>

        {totalSpent >= Number(budget) ? (
          <p className="alert danger-text">⚠ Budget limit exceeded!</p>
        ) : totalSpent >= Number(budget) * 0.8 ? (
          <p className="alert warning-text">⚠ You have used 80% of your budget.</p>
        ) : null}
      </section>

      <section className="filter-box">
        <label>View Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(event) => setSelectedMonth(event.target.value)}
        />
      </section>

      <section className="budget-box">
        <label>Set Monthly Budget: ₹</label>
        <input
          type="number"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
      </section>

      {topCategory && (
        <section className="top-category">
          🏆 Top Spending Category: <strong>{topCategory.name}</strong> — ₹
          {topCategory.value}
        </section>
      )}

      <section className="content">
        <form className="expense-form" onSubmit={addOrUpdateExpense}>
          <h2>{editingId ? 'Edit Expense' : 'Add Expense'}</h2>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Health</option>
            <option>Entertainment</option>
            <option>Others</option>
          </select>

          <input
            type="text"
            placeholder="Note (example: Lunch)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />

          <button type="submit">
            {editingId ? 'Update Expense' : 'Add Expense'}
          </button>

          {editingId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <section className="expense-list">
          <div className="list-header">
            <h2>Expenses for {selectedMonth}</h2>
            {monthlyExpenses.length > 0 && (
              <button className="clear-btn" onClick={clearAllExpenses}>
                Clear All
              </button>
            )}
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="Search expense..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="category-filter"
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
          >
            <option>All</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Health</option>
            <option>Entertainment</option>
            <option>Others</option>
          </select>

          {filteredExpenses.length === 0 ? (
            <p>No matching expenses found.</p>
          ) : (
            filteredExpenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div>
                  <strong>{expense.category}</strong>
                  <p>
                    {expense.note || 'No note added'} · {expense.date}
                  </p>
                </div>

                <div className="expense-actions">
                  <strong>₹{expense.amount}</strong>
                  <button onClick={() => editExpense(expense)}>Edit</button>
                  <button onClick={() => deleteExpense(expense.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </section>

      <section className="chart-section">
        <h2>Category-wise Expense Chart</h2>

        {categoryData.length === 0 ? (
          <p>Add expenses for this month to see the chart.</p>
        ) : (
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={105}
                  label
                >
                  {categoryData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </main>
  )
}

export default App