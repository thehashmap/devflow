-- This script initializes all databases for the DevFlow platform

-- Create databases if they don't exist
CREATE DATABASE IF NOT EXISTS devflow_users;
CREATE DATABASE IF NOT EXISTS devflow_analysis;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE devflow_users TO devflow_user;
GRANT ALL PRIVILEGES ON DATABASE devflow_analysis TO devflow_user;

-- Connect to analysis database and create initial schema
\c devflow_analysis;

-- Create initial tables for code analysis service
CREATE TABLE IF NOT EXISTS code_files (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    content TEXT,
    language VARCHAR(50),
    size_bytes BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    project_id VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS analysis_results (
    id BIGSERIAL PRIMARY KEY,
    file_id BIGINT REFERENCES code_files(id),
    analysis_type VARCHAR(50) NOT NULL,
    result_data JSONB,
    score DECIMAL(5,2),
    issues_count INTEGER DEFAULT 0,
    suggestions_count INTEGER DEFAULT 0,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_duration_ms BIGINT
);

CREATE TABLE IF NOT EXISTS analysis_issues (
    id BIGSERIAL PRIMARY KEY,
    analysis_result_id BIGINT REFERENCES analysis_results(id),
    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    line_number INTEGER,
    column_number INTEGER,
    message TEXT NOT NULL,
    suggestion TEXT,
    rule_name VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_files_project_id ON code_files(project_id);
CREATE INDEX IF NOT EXISTS idx_code_files_language ON code_files(language);
CREATE INDEX IF NOT EXISTS idx_analysis_results_file_id ON analysis_results(file_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_issues_result_id ON analysis_issues(analysis_result_id);
CREATE INDEX IF NOT EXISTS idx_analysis_issues_severity ON analysis_issues(severity);

-- Connect to users database and create initial schema
\c devflow_users;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);