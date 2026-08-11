import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import './App.css'

const COLORS = ['#7c3aed', '#db2777', '#2563eb', '#f97316', '#16a34a', '#eab308']

function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('budgetbuddyUser') || ''
  )
  const [nameInput, setNameInput] = useState('')
  const [page, setPage] = useState('dashboard')

  const [expenses, setExpenses] = useState(
    () => JSON.parse(localStorage.getItem('expenses')) || []
  )
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

  const categoryData = Object.values(
    monthlyExpenses.reduce((data, expense) => {
      if (!data[expense.category]) {
        data[expense.category] = { name: expense.category, value: 0 }
      }

      data[expense.category].value += Number(expense.amount)
      return data
    }, {})
  )

  const topCategory =
    categoryData.length > 0
      ? categoryData.reduce((top, item) => (item.value > top.value ? item : top))
      : null

  function handleLogin(event) {
    event.preventDefault()

    if (!nameInput.trim()) {
      alert('Please enter your username')
      return
    }

    localStorage.setItem('budgetbuddyUser', nameInput.trim())
    setUsername(nameInput.trim())
  }

  function handleLogout() {
    localStorage.removeItem('budgetbuddyUser')
    setUsername('')
    setNameInput('')
    setPage('dashboard')
  }

  function addExpense(event) {
    event.preventDefault()

    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const newExpense = {
      id: Date.now(),
      amount,
      category,
      note,
      date,
    }

    setExpenses([newExpense, ...expenses])
    setAmount('')
    setNote('')
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  if (!username) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-icon">💰</div>
          <h1>BudgetBuddy</h1>
          <p>Track your expenses smartly</p>

          <input
            type="text"
            placeholder="Enter your username"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
          />

          <button type="submit">Login to Dashboard</button>
        </form>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>💰 BudgetBuddy</h1>
          <p>Welcome back, {username}!</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <nav className="nav-tabs">
        <button
          className={page === 'dashboard' ? 'active' : ''}
          onClick={() => setPage('dashboard')}
        >
          Dashboard
        </button>

        <button
          className={page === 'reports' ? 'active' : ''}
          onClick={() => setPage('reports')}
        >
          Reports
        </button>
      </nav>

      {page === 'dashboard' && (
        <>
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

          <section className="content">
            <form className="expense-form" onSubmit={addExpense}>
              <h2>Add Expense</h2>

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

              <button type="submit">Add Expense</button>
            </form>

            <section className="expense-list">
              <h2>Expenses for {selectedMonth}</h2>

              {monthlyExpenses.length === 0 ? (
                <p>No expenses added for this month.</p>
              ) : (
                monthlyExpenses.map((expense) => (
                  <div className="expense-item" key={expense.id}>
                    <div>
                      <strong>{expense.category}</strong>
                      <p>{expense.note || 'No note'} · {expense.date}</p>
                    </div>

                    <div>
                      <strong>₹{expense.amount}</strong>
                      <button onClick={() => deleteExpense(expense.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </section>
        </>
      )}

      {page === 'reports' && (
        <section className="reports-page">
          <h2>Monthly Report — {selectedMonth}</h2>

          <div className="report-grid">
            <div className="report-card">
              <p>Total Expenses</p>
              <h3>{monthlyExpenses.length}</h3>
            </div>

            <div className="report-card">
              <p>Total Spent</p>
              <h3>₹{totalSpent}</h3>
            </div>

            <div className="report-card">
              <p>Top Category</p>
              <h3>{topCategory ? topCategory.name : 'No data'}</h3>
            </div>
          </div>

          <section className="chart-section">
            <h2>Category-wise Expense Chart</h2>

            {categoryData.length === 0 ? (
              <p>Add expenses to see the chart.</p>
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
        </section>
      )}
    </main>
  )
}

export default App