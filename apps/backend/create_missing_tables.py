#!/usr/bin/env python3
"""Extract and create tables from MySQL dump"""

import re
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
IMPORT_FILE = BASE_DIR / "imports" / "s4203_reports.sql"
DB_PATH = BASE_DIR / "data" / "hwm.sqlite"


def convert_create_table_to_sqlite(sql: str) -> str:
    """Convert MySQL CREATE TABLE to SQLite"""
    
    # Remove backticks
    sql = re.sub(r"`([^`]+)`", r"\1", sql)
    
    # Remove MySQL-specific ENGINE, CHARSET, COLLATE
    sql = re.sub(
        r"\) ENGINE=.*?CHARSET=[\w\d]+\s*COLLATE=[\w\d_]*\s*;",
        ");",
        sql,
        flags=re.IGNORECASE | re.DOTALL
    )
    sql = re.sub(
        r"\) DEFAULT CHARSET=[\w\d]+\s+COLLATE=[\w\d_]*\s*;",
        ");",
        sql,
        flags=re.IGNORECASE
    )
    
    # Remove CHARACTER SET from column definitions
    sql = re.sub(r"\s+CHARACTER SET utf8mb4\s+COLLATE utf8mb4_[\w_]*", "", sql)
    
    # Convert data types
    sql = re.sub(r"\bint\(\d+\)", "INTEGER", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\btinyint\(\d+\)", "INTEGER", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\bvarchar\(\d+\)", "TEXT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\blongtext\b", "TEXT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\btext\b", "TEXT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\bdatetime\b", "TEXT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\benum\([^)]+\)", "TEXT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"\bdecimal\(\d+,\d+\)", "REAL", sql, flags=re.IGNORECASE)
    
    # Handle PRIMARY KEY constraints
    # PRIMARY KEY (id) at the end should become part of column def
    sql = re.sub(r",?\s*PRIMARY KEY\s*\([^)]*\)", "", sql)
    
    # Remove KEY, INDEX definitions
    sql = re.sub(r",?\s*(UNIQUE\s+)?KEY\s+\w+\s*\([^)]*\)", "", sql)
    sql = re.sub(r",?\s*INDEX\s+\w+\s*\([^)]*\)", "", sql)
    
    # Remove CONSTRAINT definitions
    sql = re.sub(r",?\s*CONSTRAINT\s+\w+\s+FOREIGN KEY.*?\)", "", sql, flags=re.DOTALL)
    
    # Fix AUTO_INCREMENT with NOT NULL (SQLite doesn't support this combination)
    sql = re.sub(r"(\w+\s+INTEGER)\s+NOT\s+NULL\s+AUTO_INCREMENT", r"\1 PRIMARY KEY AUTOINCREMENT", sql, flags=re.IGNORECASE)
    sql = re.sub(r"(\w+\s+INTEGER)\s+AUTO_INCREMENT", r"\1 PRIMARY KEY AUTOINCREMENT", sql, flags=re.IGNORECASE)
    
    # Convert DEFAULT current_timestamp() to DEFAULT CURRENT_TIMESTAMP
    sql = re.sub(r"DEFAULT current_timestamp\(\)", "DEFAULT CURRENT_TIMESTAMP", sql, flags=re.IGNORECASE)
    sql = re.sub(r"ON UPDATE current_timestamp\(\)", "", sql, flags=re.IGNORECASE)
    
    # Remove COLLATE clauses
    sql = re.sub(r"\s+COLLATE\s+[\w_]+", "", sql)
    
    # Remove trailing commas before closing parenthesis
    sql = re.sub(r",\s*\)", ")", sql)
    
    return sql


def extract_create_statements(sql_file: Path) -> dict[str, str]:
    """Extract CREATE TABLE statements from dump"""
    tables = {}
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find CREATE TABLE statements
    pattern = r"CREATE TABLE\s+`?(\w+)`?\s+\((.*?)\)\s*(?:ENGINE|DEFAULT|;)"
    matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        table_name = match.group(1)
        create_sql = f"CREATE TABLE {table_name} ({match.group(2)});"
        tables[table_name] = create_sql
    
    return tables


def create_missing_tables():
    """Create missing tables in SQLite database"""
    
    if not IMPORT_FILE.exists():
        print(f"Error: File not found: {IMPORT_FILE}")
        return False
    
    if not DB_PATH.exists():
        print(f"Error: Database not found: {DB_PATH}")
        return False
    
    # Extract CREATE TABLE statements
    create_stmts = extract_create_statements(IMPORT_FILE)
    print(f"Found {len(create_stmts)} table definitions")
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get existing tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing_tables = {row[0] for row in cursor.fetchall()}
    print(f"Existing tables: {existing_tables}")
    
    created_count = 0
    skipped_count = 0
    
    for table_name, create_stmt in create_stmts.items():
        if table_name in existing_tables:
            print(f"  - {table_name}: already exists")
            skipped_count += 1
            continue
        
        print(f"  - Creating table: {table_name}")
        
        # Convert to SQLite syntax
        sqlite_create = convert_create_table_to_sqlite(create_stmt)
        
        try:
            cursor.execute(sqlite_create)
            created_count += 1
        except sqlite3.Error as e:
            print(f"    Error: {e}")
            print(f"    Statement: {sqlite_create[:100]}...")
    
    conn.commit()
    conn.close()
    
    print(f"\n✓ Complete!")
    print(f"  - {created_count} tables created")
    print(f"  - {skipped_count} tables already existed")
    
    return True


if __name__ == "__main__":
    create_missing_tables()
