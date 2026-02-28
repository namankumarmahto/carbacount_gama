CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    industry_id UUID,
    CONSTRAINT fk_user_industry FOREIGN KEY (industry_id) REFERENCES industry(id)
);

CREATE INDEX idx_users_email ON users(email);
