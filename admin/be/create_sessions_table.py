"""
Migration script to create user_sessions table
Run this with: python create_sessions_table.py
"""
from sqlalchemy import create_engine, text
from core.config import settings

# Create engine
engine = create_engine(settings.database_url)

# SQL to create user_sessions table
create_table_sql = """
CREATE TABLE IF NOT EXISTS user_sessions (
    SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    AccessToken TEXT NOT NULL,
    RefreshToken TEXT NOT NULL,
    DeviceInfo VARCHAR(255),
    IpAddress VARCHAR(50),
    UserAgent VARCHAR(500),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP NOT NULL,
    LastAccessedAt TIMESTAMP,
    Status VARCHAR(20) DEFAULT 'active' NOT NULL,
    FOREIGN KEY (UserID) REFERENCES users(UserID) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(UserID);
CREATE INDEX IF NOT EXISTS idx_user_sessions_status ON user_sessions(Status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_access_token ON user_sessions(AccessToken);
"""

try:
    with engine.connect() as conn:
        # Execute each statement separately
        for statement in create_table_sql.strip().split(';'):
            if statement.strip():
                conn.execute(text(statement))
                conn.commit()
    
    print("✓ user_sessions table created successfully!")
    print("✓ Indexes created successfully!")
except Exception as e:
    print(f"✗ Error creating table: {e}")
