import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ArticleListPage.css'; // To be created

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const ARTICLES_PER_PAGE = 5; // Or make this configurable

const ArticleListPage = () => {
    const { categoryId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [category, setCategory] = useState(null); // Optional: fetch category details too
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);


    useEffect(() => {
        const fetchArticlesForCategory = async () => {
            setLoading(true);
            try {
                // Fetch category details (optional, if you want to display category name/description)
                // This assumes you have a /api/categories/:id endpoint or similar
                // For now, we'll just use the categoryId.
                // const categoryRes = await axios.get(`${API_BASE_URL}/api/categories/${categoryId}`);
                // setCategory(categoryRes.data); 
                // For a simpler approach if category name isn't readily available, 
                // you might pass it via Link state or just show "Articles in Category X"

                const params = {
                    category_id: categoryId,
                    page: currentPage,
                    limit: ARTICLES_PER_PAGE
                };
                const response = await axios.get(`${API_BASE_URL}/api/articles`, { params });
                
                setArticles(response.data.data || []);
                setTotalPages(response.data.pagination.totalPages || 1);
                setTotalItems(response.data.pagination.totalItems || 0);
                setCurrentPage(response.data.pagination.currentPage || 1);
                setError(null);
            } catch (err) {
                console.error(`Error fetching articles for category ${categoryId}:`, err);
                setError(err.response?.data?.error || err.message || 'Failed to fetch articles.');
                setArticles([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArticlesForCategory();
        // Update search params when page changes
        setSearchParams({ page: currentPage.toString() });

    }, [categoryId, currentPage, setSearchParams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    // A simple way to get a category name if not fetching full category details
    // This is a placeholder. Ideally, fetch category name or pass via route state.
    const categoryDisplayName = `Category ${categoryId}`;


    return (
        <div className="article-list-page">
            <header className="page-header">
                <h1>Articles in {category?.name || categoryDisplayName}</h1>
            </header>

            {loading && <p className="loading-message">Loading articles...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && !error && articles.length === 0 && (
                <p className="no-articles-message">No articles found in this category yet.</p>
            )}

            {!loading && !error && articles.length > 0 && (
                <div className="articles-container">
                    {articles.map(article => (
                        <article key={article.id} className="article-summary-item">
                            <h2><Link to={`/articles/${article.id}`}>{article.title}</Link></h2>
                            {/* The backend mock for GET /api/articles needs to include a summary */}
                            <p className="article-meta">By {article.author || 'Unknown Author'} on {new Date(article.published_at).toLocaleDateString()}</p>
                            <p className="article-excerpt">{article.summary || 'No summary available.'}</p>
                            <Link to={`/articles/${article.id}`} className="read-more-link">Read More &raquo;</Link>
                        </article>
                    ))}
                </div>
            )}

            {!loading && !error && totalItems > ARTICLES_PER_PAGE && (
                 <div className="pagination-controls">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        &laquo; Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        Next &raquo;
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArticleListPage;
