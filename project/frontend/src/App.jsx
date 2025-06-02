import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticleListPage from './pages/ArticleListPage'; // Will create this
import ArticleDetailPage from './pages/ArticleDetailPage'; // Will create this
import './App.css'; 

function App() {
  return (
    <div className="App">
      {/* Could add a global Navbar/Header component here if needed */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/categories/:categoryId/articles" element={<ArticleListPage />} />
        <Route path="/articles/:articleId" element={<ArticleDetailPage />} />
        {/* Add a 404 Not Found route later if desired */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
      {/* Could add a global Footer component here */}
    </div>
  );
}

export default App;
