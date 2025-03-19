const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script starting');

// Add error handling wrapper for IPC calls
const safeIpc = (channel, ...args) => {
  try {
    console.log(`Calling IPC channel: ${channel}`);
    return ipcRenderer.invoke(channel, ...args)
      .then(result => {
        console.log(`IPC call successful: ${channel}`);
        return result;
      })
      .catch(error => {
        console.error(`IPC error (${channel}):`, error);
        throw error;
      });
  } catch (error) {
    console.error(`IPC invocation error (${channel}):`, error);
    throw error;
  }
};

try {
  contextBridge.exposeInMainWorld(
    'api', {
      // category operations
      getCategories: () => safeIpc('get-categories'),
      addCategory: (category) => safeIpc('add-category', category), 
      updateCategory: (id, category) => safeIpc('update-category', id, category),
      deleteCategory: (id) => safeIpc('delete-category', id),
      
      // expense operations
      getExpenses: (categoryId) => safeIpc('get-expenses', categoryId),
      addExpense: (expense) => safeIpc('add-expense', expense),
      updateExpense: (id, expense) => safeIpc('update-expense', id, expense),
      deleteExpense: (id) => safeIpc('delete-expense', id),
      
      // analytics operations
      getMonthlyTotals: () => safeIpc('get-monthly-totals'),
      getCategoryTotals: () => safeIpc('get-category-totals'),
      getSubcategoryTotals: (categoryId) => safeIpc('get-subcategory-totals', categoryId),
    }
  );
  console.log('Preload Successful - API exposed to renderer');
} catch (error) {
  console.error('Error: Failed to expose API in preload script', error);
}