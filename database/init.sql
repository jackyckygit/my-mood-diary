-- This script will be executed when the PostgreSQL container is first created.
-- It sets up the required tables for the My Mood Diary application.
-- The database specified by the POSTGRES_DB environment variable (mood_diary)
-- is created automatically, and this script is run against it.

-- Create the 'users' table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the 'diaries' table
CREATE TABLE diaries (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    diary_date DATE NOT NULL,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    UNIQUE (owner_id, diary_date)
);