import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem('expenses')) || []
  })

  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')

  const [budget, setBudget] = useState(() => {
    return localStorage.getItem('budget') || '10000'
  })

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('budget', budget)
  }, [budget])

  const totalSpent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  )

  const remaining = Number(budget) - totalSpent

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
    }

    setExpenses([newExpense, ...expenses])
    setAmount('')
    setNote('')
  }

  function deleteExpense(id) {
    setExpenses(expenses.filter((expense) => expense.id !== id))
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

          <button type="submit">Add Expense</button>
        </form>

        <section className="expense-list">
          <h2>Your Expenses</h2>

          {expenses.length === 0 ? (
            <p>No expenses added yet.</p>
          ) : (
            expenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div>
                  <strong>{expense.category}</strong>
                  <p>{expense.note || 'No note added'}</p>
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
    </main>
  )
}

export default App