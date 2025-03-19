import React, {useState, useEffect} from 'react';
import '../styles/Dashboard.css';

const Dashboard = ({categories}) => {
    const [loading, setLoading] = useState(true);
    const [categoryTotals, setCategoryTotals] = useState([]);
    const [monthlyTotals, setMonthlyTotals] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch cat totals
                const catTotals = await window.api.getCategoryTotals();
                setCategoryTotals(catTotals);

                // Fetch monthly totals
                const monthData = await window.api.getMonthlyTotals();
                setMonthlyTotals(monthData);

                // Fetch recents
                const expenses = await window.api.getExpenses();
                setRecentExpenses(expenses.slice(0,5));
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data for dashboard', error);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const totalSpending = categoryTotals.reduce((sum,category) => sum + parseFloat(category.total),0);

    return (
        <div className="dashboard">
          <h1 className="dashboard-title">Dashboard</h1>
          
          {loading ? (
            <div className="loading">Loading dashboard data...</div>
          ) : (
            <>
              <div className="dashboard-summary">
                <div className="summary-card total-card">
                  <h3 className="card-label">Total Spending</h3>
                  <div className="card-value">${totalSpending.toFixed(2)}</div>
                </div>
                
                <div className="summary-card categories-card">
                  <h3 className="card-label">Categories</h3>
                  <div className="card-value">{categories.length}</div>
                </div>
              </div>
              
              <div className="dashboard-grid">
                <div className="dashboard-section">
                  <h2 className="section-title">Spending by Category</h2>
                  {categoryTotals.length === 0 ? (
                    <p className="no-data">No category data available</p>
                  ) : (
                    <div className="category-chart">
                      {categoryTotals.map(category => (
                        <div key={category.id} className="category-bar-container">
                          <div className="category-bar-label">
                            <span 
                              className="category-color" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="category-name">{category.name}</span>
                          </div>
                          <div className="category-bar-wrapper">
                            <div 
                              className="category-bar" 
                              style={{ 
                                width: `${(category.total / totalSpending) * 100}%`,
                                backgroundColor: category.color 
                              }}
                            />
                            <span className="category-amount">${parseFloat(category.total).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="dashboard-section">
                  <h2 className="section-title">Recent Expenses</h2>
                  {recentExpenses.length === 0 ? (
                    <p className="no-data">No recent expenses</p>
                  ) : (
                    <table className="expense-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Name</th>
                          <th>Date</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentExpenses.map(expense => (
                          <tr key={expense.id}>
                            <td>
                              <div className="table-category">
                                <span 
                                  className="category-color" 
                                  style={{ backgroundColor: expense.category_color }}
                                />
                                <span>{expense.category_name}</span>
                              </div>
                            </td>
                            <td>{expense.name}</td>
                            <td>{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="amount">${parseFloat(expense.amount).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
};
export default Dashboard;