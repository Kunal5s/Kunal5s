-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Images Table
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE, -- Or use UUID for filenames to ensure uniqueness if names can collide
    alt_text VARCHAR(255),
    url VARCHAR(2048) NOT NULL, -- URL to the image, could be a path or a full CDN link
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INT NOT NULL,
    image_id INT, -- Nullable if an article doesn't necessarily need an image
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category
        FOREIGN KEY(category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE, -- If a category is deleted, delete related articles
    CONSTRAINT fk_image
        FOREIGN KEY(image_id)
        REFERENCES images(id)
        ON DELETE SET NULL -- If an image is deleted, set image_id to NULL in articles
);

-- Optional: Create indexes for frequently queried columns
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_categories_name ON categories(name);
