import React, {useState} from "react";
import '../styles/CategoryManager.css';
import Modal from 'react-modal';
Modal.setAppElement('#root')
const CategoryManager = ({categories, setCategories}) => {
    const [newCategory, setNewCategory] = useState({
        name:'',
        color: '#3498db',
        icon: '',
    });

    const [editingCategory, setEditingCategory] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    // Add state for modals
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
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


    // Handle new category
    const handleAddCategory = async (e) => {
        e.preventDefault();
        try{
            const addedCategory = await window.api.addCategory(newCategory);
            setCategories([...categories, addedCategory]);
            setNewCategory({
                name: '',
                color: '#3498db',
                icon: '',
            });
        } catch (error) {
            console.error('Error adding category', error);
            setErrorMessage('Failed to add category');
            setErrorModalOpen(true);
        }
    };

    // Handle updating category
    const handleUpdateCategory = async (e) => {
        e.preventDefault();

        try {
            const updatedCategory = await window.api.updateCategory(editingCategory.id, editingCategory);
            setCategories(categories.map( cat=>
                cat.id === updatedCategory.id ? updatedCategory : cat
            ));
            setIsEditing(false);
            setEditingCategory(null);
        } catch (error) {
            console.log('Error updating category', error);
            setErrorMessage('Failed to update category');
            setErrorModalOpen(true);
        }
    };

    
    // Handle deleting category
    const openDeleteModal = (id) => {
      setCategoryToDelete(id);
      setDeleteModalOpen(true);
    };
    const handleDeleteCategory = async () => {
      try {
          await window.api.deleteCategory(categoryToDelete);
          setCategories(categories.filter(cat => cat.id !== categoryToDelete));

          if (editingCategory && editingCategory.id === categoryToDelete) {
              setIsEditing(false);
              setEditingCategory(null);
          }
          
          // Close the modal
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
      } catch (error) {
          console.log('Error deleting category', error);
          setDeleteModalOpen(false);
          setErrorMessage('Failed to delete category');
          setErrorModalOpen(true)
      }
  };
  const startEditing = (category) => {
    setEditingCategory({ ...category });
    setIsEditing(true);
};

const cancelEditing = () => {
    setIsEditing(false);
    setEditingCategory(null);
};

    return (
        <div className="category-manager">
      <h1 className="page-title">Manage Categories</h1>
      
      <div className="category-form-container">
        <div className="category-form-card">
          <h2 className="form-title">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          
          <form onSubmit={isEditing ? handleUpdateCategory : handleAddCategory}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-input"
                value={isEditing ? editingCategory.name : newCategory.name}
                onChange={(e) => {
                  if (isEditing) {
                    setEditingCategory({ ...editingCategory, name: e.target.value });
                  } else {
                    setNewCategory({ ...newCategory, name: e.target.value });
                  }
                }}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker-container">
                <input
                  type="color"
                  className="color-picker"
                  value={isEditing ? editingCategory.color : newCategory.color}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditingCategory({ ...editingCategory, color: e.target.value });
                    } else {
                      setNewCategory({ ...newCategory, color: e.target.value });
                    }
                  }}
                />
                <span className="color-preview" style={{
                  backgroundColor: isEditing ? editingCategory.color : newCategory.color
                }} />
              </div>
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
                {isEditing ? 'Update Category' : 'Add Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="categories-list">
                <h2 className="section-title">Your Categories</h2>
                
                {categories.length === 0 ? (
                    <p className="no-categories-message">
                        You haven't created any categories yet. Create your first category to get started!
                    </p>
                ) : (
                    <div className="category-cards">
                        {categories.map(category => (
                            <div 
                                key={category.id} 
                                className={`category-card ${editingCategory && editingCategory.id === category.id ? 'editing' : ''}`}
                            >
                                <div className="category-header" style={{ backgroundColor: category.color }}>
                                    <h3 className="category-name">{category.name}</h3>
                                </div>
                                <div className="category-actions">
                                    <button 
                                        className="btn btn-secondary"
                                        onClick={() => startEditing(category)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => openDeleteModal(category.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onRequestClose={() => setDeleteModalOpen(false)}
                style={customModalStyles}
                contentLabel="Delete Confirmation"
            >
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this category? All expenses tied to this category will be deleted as well.</p>
                <div className="modal-actions">
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setDeleteModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleDeleteCategory}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
            
            {/* Error Modal */}
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
                </div>
    );
};
export default CategoryManager;