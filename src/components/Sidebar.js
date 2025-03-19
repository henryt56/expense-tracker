import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ categories, activeView, setActiveView, onCategorySelect }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Expense Tracker</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-items">
          <li 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </li>
          <li 
            className={`nav-item ${activeView === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveView('categories')}
          >
            Manage Categories
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-categories">
        <h2 className="sidebar-subtitle">Your Categories</h2>
        {categories.length === 0 ? (
          <p className="no-categories">No categories yet</p>
        ) : (
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category.id} 
                className="category-item"
                onClick={() => onCategorySelect(category.id)}
                style={{ borderColor: category.color }}
              >
                <span className="category-color" style={{ backgroundColor: category.color }}></span>
                <span className="category-name">{category.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;