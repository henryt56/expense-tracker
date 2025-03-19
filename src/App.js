import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import ExpenseManager from './components/ExpenseManager';
import './styles/App.css';

function App(){
    const [activeView, setActiveView] = useState('dashboard');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch categories on intial load
    useEffect(()=> {
        const fetchCategories = async () => {
            try {
                const categories = await window.api.getCategories();
                setCategories(categories);
                setLoading(false);    
            } catch (error) {
                console.error('Error fetching categories', error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Handle category selection
    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        setActiveView('expenses');
    };
    //Render
    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard' : 
                return <Dashboard categories={categories} />;
            case 'categories':
                return (<CategoryManager 
                    categories={categories}
                    setCategories={setCategories} 
                    />
                );
            case 'expenses' :
                return (<ExpenseManager 
                    categories={categories}
                    selectedCategory={selectedCategory} 
                    />
                );
                default: 
                return <Dashboard categories={categories} />;
        }
    };

    return (
        <div className ='app'>
            <Sidebar 
                categories={categories}
                activeView={activeView}
                setActiveView={setActiveView}
                onCategorySelect={handleCategorySelect}
            />
            <main className="main-content">
                {loading ? (
                    <div className="loading">
                        Page loading...
                    </div>
                ) : (
                    renderActiveView()
                )}
            </main>
        </div>
    );
}

export default App;