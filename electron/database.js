const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app } = require('electron');

let userDataPath;
try {
  // Use the app object if available (in Electron context)
  if (app) {
    userDataPath = app.getPath('userData');
    console.log('Using Electron app.getPath for userData:', userDataPath);
  } else {
    throw new Error('app object not available');
  }
} catch (error) {
  console.warn('Falling back to manual userDataPath calculation:', error);
  // Fallback for when running outside of Electron
  userDataPath = path.join(process.env.APPDATA || 
    (process.platform === 'darwin' ? 
      path.join(process.env.HOME, 'Library', 'Application Support') : 
      path.join(process.env.HOME, '.local', 'share')),
    'expense-tracker');
}

console.log('Database location:', userDataPath);

// Check if dir exists
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive:true});
}

// initialize db connection
const dbPath = path.join(userDataPath, 'expense-tracker.db')

let db;
try {
  db = new Database(dbPath, {
    verbose: console.log, //remove in prod
    fileMustExist: false
  });
  // enalbe forein keys
  db.pragma('foreign_keys = ON');
  console.log('SQLITE databse connected successfully');
} catch (error) {
  console.error('Error connecting to SQLite', error);
  throw error;
}



// intialize db tables
async function initializeDatabase() {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#3498db',
      icon TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT NOT NULL,
        subcategory TEXT DEFAULT 'Misc.',
        amount DECIMAL(12,2) NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIME_STAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE

        );
        `);
        console.log('Database initialized successfully.')
        return true;
  } catch (error) {
    console.log('Error initializing database', error);
    return false;
  }
}

// Category Operations

function getCategories() {
  try {
    const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
    return stmt.all();
  }  catch (error) {
    console.error('Error fetching categories', error);
    throw error;
  }
}


function addCategory(category) {
    try {
        const { name, color, icon } = category;
        const stmt = db.prepare(
            'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?) RETURNING *'
        );
        return stmt.get(name, color, icon)
    } catch (error) {
        console.error('Error adding category:', error);
        throw error;
    }
}

function updateCategory(id, category) {
    try {
      const { name, color, icon } = category;
      const stmt = db.prepare(
        'UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? RETURNING *'
      );
      return stmt.get(name, color, icon, id);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

async function deleteCategory(id) {
    try {
        const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
        stmt.run(id);
        return true;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}

// Expense Operations

function getExpenses(categoryId = null) {
    try {
        let query = `
        SELECT
          e.*,
          c.name as category_name,
          c.color as category_color
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        `;

        if (categoryId) {
            query += ' WHERE e.category_id = ?';
            query += ' ORDER BY e.date DESC';
            const stmt = db.prepare(query);
            return stmt.all(categoryId);
        } else {
          query += ' ORDER BY e.date DESC';
          const stmt = db.prepare(query);
          return stmt.all();
        }
        
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
}
  function addExpense(expense) {
    try {
      const { category_id, name, subcategory, amount, date, notes } = expense;
      const stmt = db.prepare(
        'INSERT INTO expenses (category_id, name, subcategory, amount, date, notes) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      );
        return stmt.get(category_id, name, subcategory || 'Misc', amount, date, notes);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }


async function updateExpense(id, expense) {
  try {
    const { category_id, name, subcategory, amount, date, notes } = expense;
    const stmt = db.prepare(
      'UPDATE expenses SET category_id = ?, name = ?, subcategory = ?, amount = ?, date = ?, notes = ? WHERE id = ? RETURNING *'
    );
    return stmt.get(category_id, name, subcategory || 'Misc', amount, date, notes, id);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

async function deleteExpense(id) {
  try {
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}
// Analytics Operations

async function getMonthlyTotals() {
  try {
    const stmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as total
      FROM expenses
      GROUP BY month
      ORDER BY month
    `);
    return stmt.all();
  } catch (error) {
    console.error('Error getting monthly totals:', error);
    throw error;
  }
}
  
  async function getCategoryTotals() {
    try {
      const stmt = db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.color,
          COALESCE(SUM(e.amount), 0) as total
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id
        GROUP BY c.id, c.name, c.color
        ORDER BY total DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting category totals:', error);
      throw error;
    }
  }
  

  async function getSubcategoryTotals(categoryId) {
    try {
      const stmt = db.prepare(`
        SELECT 
          e.subcategory,
          COALESCE(SUM(e.amount), 0) as total
        FROM expenses e
        WHERE e.category_id = ?
        GROUP BY e.subcategory
        ORDER BY total DESC
      `);
      return stmt.all(categoryId);
    } catch (error) {
      console.error('Error getting subcategory totals:', error);
      throw error;
    }
  }

  function closeDatabase() {
    if (db) {
      db.close();
      console.log('Database connection closed.')
    }
  }

  // Export
  module.exports = {
    initializeDatabase,
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getMonthlyTotals,
    getCategoryTotals,
    getSubcategoryTotals,
    closeDatabase
  };