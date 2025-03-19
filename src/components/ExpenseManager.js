import React, {useState, useEffect} from "react";
import '../styles/ExpenseManager.css';
import Modal from 'react-modal';
Modal.setAppElement('#root')
const ExpenseManager = ({categories, selectedCategory}) => {

    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newExpense, setNewExpense] = useState({
        category_id: selectedCategory || '',
        name:'',
        amount:'',
        subcategory: 'Misc',
        date: new Date().toISOString().split('T')[0],
        notes:'',
    });
    const [editingExpense, setEditingExpense] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [subcategoryTotals, setSubcategoryTotals] = useState([]);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Modal styles
    const customModalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%'
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }
    };

    // Find selected category
    const category = categories.find(cat => cat.id === selectedCategory) || null;

    // Load expenses when component mounts or cat changes

    useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          // Load expenses
          const data = await window.api.getExpenses(selectedCategory);
          setExpenses(data);
          
          // Load subcategory totals if a category is selected
          if (selectedCategory) {
            const subTotals = await window.api.getSubcategoryTotals(selectedCategory);
            setSubcategoryTotals(subTotals);
          }
          
          // Rest of your existing code...
          setLoading(false);
        } catch (error) {
          console.error('Error loading data', error);
          setLoading(false);
        }
      };
      
      loadData();
    }, [selectedCategory]);

    // Handle adding a new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    try {
      const expenseToAdd = {
        ...newExpense,
        amount: parseFloat(newExpense.amount)
      };
      
      const addedExpense = await window.api.addExpense(expenseToAdd);
      
      // Update the expenses list with the new expense
      const updatedExpense = {
        ...addedExpense,
        category_name: categories.find(cat => cat.id === addedExpense.category_id).name,
        category_color: categories.find(cat => cat.id === addedExpense.category_id).color
      };
      
      setExpenses([updatedExpense, ...expenses]);
      
      // Reset the form
      setNewExpense({
        category_id: selectedCategory || '',
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrorMessage('Failed to add expense');
      setErrorModalOpen(true);
    }
  };

        // Handle updating expense

        const handleUpdateExpense = async (e) => {
            e.preventDefault();

            try {
                const expenseToUpdate = {
                    ...editingExpense,
                    amount: parseFloat(editingExpense.amount)
                };

                const updatedExpense = await window.api.updateExpense(editingExpense.id, expenseToUpdate);

                // Update expenses list
                const enhancedExpense = {
                    ...updatedExpense,
                    category_name: categories.find(cat => cat.id === updatedExpense.category_id).name,
                    category_color: categories.find(cat => cat.id === updatedExpense.category_id).color
                };

                setExpenses(expenses.map(exp =>
                    exp.id === enhancedExpense.id ? enhancedExpense : exp
                ));
                // Exit editing
                setIsEditing(false);
                setEditingExpense(null);
            } catch (error) {
                console.error('Erorr updating expense', error);
                setErrorMessage('Failed to update expense');
                setErrorModalOpen(true);
            }
        };

        // Handle deleting
        const openDeleteModal = (id) => {
          setExpenseToDelete(id);
          setDeleteModalOpen(true);
      };
      
      const handleDeleteExpense = async () => {
        try {
            await window.api.deleteExpense(expenseToDelete);
            setExpenses(expenses.filter(exp => exp.id !== expenseToDelete));

            // Exit editing if we are editing the expense that was deleted
            if (editingExpense && editingExpense.id === expenseToDelete) {
                setIsEditing(false);
                setEditingExpense(null);
            }
            
            // Close the modal
            setDeleteModalOpen(false);
            setExpenseToDelete(null);
        } catch (error) {
            console.error('Error deleting expense', error);
            setDeleteModalOpen(false);
            setErrorMessage('Failed to delete expense');
            setErrorModalOpen(true);
        }
    };

    // Start editing
    const startEditing = (expense) => {
        setEditingExpense({...expense});
        setIsEditing(true);
    };

    // Canceling
    const cancelEditing = () => {
        setIsEditing(false);
        setEditingExpense(null);
    };

    const formatAmount = (amount) => {
        return parseFloat(amount).toFixed(2);
    };

        // Calc category total
        const totalAmount = expenses.reduce((total,expense) => total + parseFloat(expense.amount), 0);

        return (
            <div className="expense-manager">
              <div className="expense-header">
                <h1 className="page-title">
                  {category ? `Expenses - ${category.name}` : 'All Expenses'}
                </h1>
                
                {category && (
                  <div className="category-badge" style={{ backgroundColor: category.color }}>
                    {category.name}
                  </div>
                )}
              </div>
              {category && subcategoryTotals.length > 0 && (
                  <div className="subcategory-breakdown">
                    <h3>Subcategory Breakdown</h3>
                    <div className="subcategory-chart">
                      {subcategoryTotals.map((sub, index) => (
                        <div key={index} className="subcategory-bar-container">
                          <div className="subcategory-bar-label">
                            <span>{sub.subcategory}</span>
                          </div>
                          <div className="subcategory-bar-wrapper">
                            <div 
                              className="subcategory-bar" 
                              style={{ 
                                width: `${(sub.total / totalAmount) * 100}%`,
                                backgroundColor: category.color 
                              }}
                            />
                            <span className="subcategory-amount">${parseFloat(sub.total).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="expense-form-container">
                <div className="expense-form-card">
                  <h2 className="form-title">
                    {isEditing ? 'Edit Expense' : 'Add New Expense'}
                  </h2>
                  
                  <form onSubmit={isEditing ? handleUpdateExpense : handleAddExpense}>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={isEditing ? editingExpense.category_id : newExpense.category_id}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (isEditing) {
                            setEditingExpense({ ...editingExpense, category_id: value });
                          } else {
                            setNewExpense({ ...newExpense, category_id: value });
                          }
                        }}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={isEditing ? editingExpense.name : newExpense.name}
                        onChange={(e) => {
                          if (isEditing) {
                            setEditingExpense({ ...editingExpense, name: e.target.value });
                          } else {
                            setNewExpense({ ...newExpense, name: e.target.value });
                          }
                        }}
                        placeholder="What did you spend on?"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subcategory</label>
                      <input
                        type="text"
                        className="form-input"
                        value={isEditing ? editingExpense.subcategory : newExpense.subcategory}
                        onChange={(e) => {
                          if (isEditing) {
                            setEditingExpense({ ...editingExpense, subcategory: e.target.value });
                          } else {
                            setNewExpense({ ...newExpense, subcategory: e.target.value });
                          }
                        }}
                        placeholder="E.g., Fruits, Vegetables, Meat, etc."
                      />
                      <small className="form-text text-muted">
                        Leave empty to use 'Misc' as default
                      </small>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          className="form-input"
                          value={isEditing ? editingExpense.amount : newExpense.amount}
                          onChange={(e) => {
                            if (isEditing) {
                              setEditingExpense({ ...editingExpense, amount: e.target.value });
                            } else {
                              setNewExpense({ ...newExpense, amount: e.target.value });
                            }
                          }}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={isEditing ? editingExpense.date : newExpense.date}
                          onChange={(e) => {
                            if (isEditing) {
                              setEditingExpense({ ...editingExpense, date: e.target.value });
                            } else {
                              setNewExpense({ ...newExpense, date: e.target.value });
                            }
                          }}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Notes (Optional)</label>
                      <textarea
                        className="form-input"
                        value={isEditing ? editingExpense.notes : newExpense.notes}
                        onChange={(e) => {
                          if (isEditing) {
                            setEditingExpense({ ...editingExpense, notes: e.target.value });
                          } else {
                            setNewExpense({ ...newExpense, notes: e.target.value });
                          }
                        }}
                        placeholder="Add any additional details"
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-actions">
                      {isEditing && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary">
                        {isEditing ? 'Update Expense' : 'Add Expense'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
              <div className="expenses-list-container">
                <div className="expenses-header">
                  <h2 className="section-title">Expense History</h2>
                  <div className="total-spending">
                    Total: <span className="total-amount">${formatAmount(totalAmount)}</span>
                  </div>
                </div>
                
                {loading ? (
                  <div className="loading">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                  <div className="no-expenses-message">
                    No expenses found. Add your first expense to get started!
                  </div>
                ) : (
                  <table className="expenses-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(expense => (
                        <tr key={expense.id} className={editingExpense && editingExpense.id === expense.id ? 'editing' : ''}>
                          <td>{expense.name}</td>
                          <td>
                            <div className="table-category">
                              <span 
                                className="category-color" 
                                style={{ backgroundColor: expense.category_color }}
                              />
                              <span>{expense.category_name}</span>
                            </div>
                          </td>
                          <td>{expense.subcategory}</td>
                          <td>{new Date(expense.date).toLocaleDateString()}</td>
                          <td className="expense-amount">${formatAmount(expense.amount)}</td>
                          <td className="expense-notes" title={expense.notes || '-'}>
                            {expense.notes || '-'}
                          </td>
                          <td className="actions-cell">
                          <button
                            className="btn-icon edit-btn"
                            onClick={() => startEditing(expense)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon delete-btn"
                            onClick={() => openDeleteModal(expense.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                            <Modal
                                isOpen={deleteModalOpen}
                                onRequestClose={() => setDeleteModalOpen(false)}
                                style={customModalStyles}
                                contentLabel="Delete Confirmation"
                            >
                                <h2>Confirm Delete</h2>
                                <p>Are you sure you want to delete this expense?</p>
                                <div className="modal-actions">
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setDeleteModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={handleDeleteExpense}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Modal>
                            <Modal
                                isOpen={errorModalOpen}
                                onRequestClose={() => setErrorModalOpen(false)}
                                style={customModalStyles}
                                contentLabel="Error"
                            >
                                <h2>Error</h2>
                                <p>{errorMessage}</p>
                                <div className="modal-actions">
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => setErrorModalOpen(false)}
                                    >
                                        OK
                                    </button>
                                </div>
                            </Modal>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
};
export default ExpenseManager;