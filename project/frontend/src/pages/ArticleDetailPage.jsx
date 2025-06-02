import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ArticleDetailPage.css'; // To be created

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const ArticleDetailPage = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/articles/${articleId}`);
                setArticle(response.data);
                setError(null);
            } catch (err) {
                console.error(`Error fetching article ${articleId}:`, err);
                setError(err.response?.data?.error || err.message || 'Failed to fetch article.');
                setArticle(null);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    if (loading) {
        return <p className="loading-message loading-message-detail">Loading article...</p>;
    }

    if (error) {
        return <p className="error-message error-message-detail">Error: {error}</p>;
    }

    if (!article) {
        return <p className="no-article-message">Article not found.</p>;
    }

    // Basic Markdown-like text formatting for content (newlines to <br>)
    // A more robust solution would use a Markdown parser like 'marked' or 'react-markdown'
    const formatContent = (text) => {
        if (!text) return '';
        // Replace newlines with <br /> tags
        // For a real app, sanitize this HTML or use a Markdown renderer.
        return text.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
                {paragraph}
                <br />
            </React.Fragment>
        ));
    };


    return (
        <article className="article-detail-page">
            <header className="article-header">
                <h1>{article.title}</h1>
                <p className="article-meta">
                    By {article.author || 'Unknown Author'} | Published on {new Date(article.published_at).toLocaleDateString()}
                    {article.category_name && (
                        <> | Category: <Link to={`/categories/${article.category_id}/articles`}>{article.category_name}</Link></>
                    )}
                </p>
            </header>

            {article.image_url && (
                <div className="article-image-container">
                    <img src={article.image_url} alt={article.image_alt_text || article.title} className="article-image" />
                </div>
            )}
            
            {article.summary && (
                <section className="article-summary">
                    <h2>Summary</h2>
                    <p>{article.summary}</p>
                </section>
            )}

            <section className="article-content">
                <h2>Full Article</h2>
                {/* Using dangerouslySetInnerHTML is risky if content isn't sanitized.
                    For now, using a simple newline formatter.
                    For production, use a Markdown library for safe rendering.
                */}
                <div className="content-body">
                    {formatContent(article.content)}
                </div>
            </section>

            <nav className="article-navigation">
                {/* TODO: Add "Previous/Next Article" links if API supports fetching adjacent articles */}
                <Link to="/" className="back-to-home-link">Back to Homepage</Link>
                {article.category_id && 
                    <Link to={`/categories/${article.category_id}/articles`} className="back-to-category-link">
                        Back to {article.category_name || `Category ${article.category_id}`}
                    </Link>
                }
            </nav>
        </article>
    );
};

export default ArticleDetailPage;
