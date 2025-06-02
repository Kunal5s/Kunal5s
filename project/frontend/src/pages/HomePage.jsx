import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Correctly import Link
import axios from 'axios';
import './HomePage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const HomePage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/api/categories`);
                setCategories(response.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err.response?.data?.error || err.message || 'Failed to fetch categories. Please try again later.');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div className="homepage">
            <header className="homepage-header">
                <h1>Welcome to Our Automotive Blog!</h1>
                <p>Explore articles by category.</p>
            </header>

            <main>
                <h2>Categories</h2>
                {loading && <p className="loading-message">Loading categories...</p>}
                {error && <p className="error-message">Error: {error}</p>}
                
                {!loading && !error && categories.length === 0 && (
                    <p className="no-categories-message">No categories found. Check back soon!</p>
                )}

                {!loading && !error && categories.length > 0 && (
                    <ul className="categories-list">
                        {categories.map(category => (
                            <li key={category.id} className="category-item">
                                <h3>{category.name}</h3>
                                <p>{category.description || 'No description available.'}</p>
                                <Link to={`/categories/${category.id}/articles`} className="category-link">View Articles</Link> 
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            <footer className="homepage-footer">
                <p>&copy; {new Date().getFullYear()} AutoBlog. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
