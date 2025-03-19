const { ipcMain } = require('electron');
const {
   getCategories,
   addCategory,
   updateCategory,
   deleteCategory,
   getExpenses,
   addExpense,
   deleteExpense,
   updateExpense,
   getMonthlyTotals,
   getCategoryTotals,
   getSubcategoryTotals
} = require("./database");

function setupIpcHandlers() {
    // Category handlers
    ipcMain.handle('get-categories', async () => {
      try {
        return await getCategories();
      } catch (error) {
        console.error('IPC get-categories error:', error);
        throw error;
      }
    });
  
    ipcMain.handle('add-category', async (_, category) => {
      try {
        return await addCategory(category);
      } catch (error) {
        console.error('IPC add-category error:', error);
        throw error;
      }
    });
  
    ipcMain.handle('update-category', async (_, id, category) => {
      try {
        return await updateCategory(id, category);
      } catch (error) {
        console.error('IPC update-category error:', error);
        throw error;
      }
    });
  
    ipcMain.handle('delete-category', async (_, id) => {
      try {
        return await deleteCategory(id);
      } catch (error) {
        console.error('IPC delete-category error:', error);
        throw error;
      }
    });

    // Expense handlers
  ipcMain.handle('get-expenses', async (_, categoryId) => {
    try {
      return await getExpenses(categoryId || null);
    } catch (error) {
      console.error('IPC get-expenses error:', error);
      throw error;
    }
  });

  ipcMain.handle('add-expense', async (_, expense) => {
    try {
      return await addExpense(expense);
    } catch (error) {
      console.error('IPC add-expense error:', error);
      throw error;
    }
  });

  ipcMain.handle('update-expense', async (_, id, expense) => {
    try {
      return await updateExpense(id, expense);
    } catch (error) {
      console.error('IPC update-expense error:', error);
      throw error;
    }
  });

  ipcMain.handle('delete-expense', async (_, id) => {
    try {
      return await deleteExpense(id);
    } catch (error) {
      console.error('IPC delete-expense error:', error);
      throw error;
    }
  });

  // Analytics handlers
  ipcMain.handle('get-monthly-totals', async () => {
    try {
      return await getMonthlyTotals();
    } catch (error) {
      console.error('IPC get-monthly-totals error:', error);
      throw error;
    }
  });

  ipcMain.handle('get-category-totals', async () => {
    try {
      return await getCategoryTotals();
    } catch (error) {
      console.error('IPC get-category-totals error:', error);
      throw error;
    }
  });

  ipcMain.handle('get-subcategory-totals', async (_, categoryId) => {
    try {
      return await getSubcategoryTotals(categoryId);
    } catch (error) {
      console.error('IPC get-subcategory-totals error:', error);
      throw error;
    }
  });
}

  

module.exports = {setupIpcHandlers};