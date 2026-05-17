#!/usr/bin/env python3
"""Import data from MySQL dump file to SQLite database"""

import re
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
IMPORT_FILE = BASE_DIR / "imports" / "s4203_reports.sql"
DB_PATH = BASE_DIR / "data" / "hwm.sqlite"


def extract_insert_statements(sql_file: Path) -> list[str]:
    """Extract INSERT statements from MySQL dump file"""
    inserts = []
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all INSERT statements - they may span multiple lines
    # Pattern: INSERT INTO `table_name` (...) VALUES (...) [, (...)]* ;
    pattern = r"INSERT INTO\s+`?(\w+)`?\s+\(([^)]+)\)\s+VALUES\s+(.*?)(?=;)"
    matches = re.finditer(pattern, content, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        table_name = match.group(1)
        column_str = match.group(2)
        values_section = match.group(3).strip()
        
        # Parse column names (remove backticks)
        columns = []
        for col in column_str.split(','):
            col = col.strip()
            col = col.strip('`')
            columns.append(col)
        
        # Parse values - split by '),(' to get individual rows
        value_rows = []
        current_row = []
        current_val = []
        in_string = False
        i = 0
        
        # Ensure values section starts with (
        if values_section.startswith('('):
            values_section = values_section[1:]
        
        while i < len(values_section):
            char = values_section[i]
            
            # Handle escaped quotes
            if i > 0 and values_section[i-1] == '\\' and char == "'":
                current_val.append(char)
                i += 1
                continue
            
            # Toggle string state
            if char == "'":
                in_string = not in_string
                current_val.append(char)
            # End of value
            elif char == ',' and not in_string:
                current_row.append(''.join(current_val).strip())
                current_val = []
            # End of row
            elif char == ')' and not in_string:
                current_row.append(''.join(current_val).strip())
                if current_row and any(v for v in current_row):  # Skip empty rows
                    value_rows.append(current_row)
                current_row = []
                current_val = []
                i += 1  # Skip the closing )
                if i < len(values_section) and values_section[i] == ',':
                    i += 1  # Skip comma
                # Skip whitespace and opening paren of next row
                while i < len(values_section) and values_section[i] in ' \n\t(':
                    i += 1
                continue
            else:
                current_val.append(char)
            
            i += 1
        
        # Create SQLite INSERT statements
        for row_values in value_rows:
            if len(row_values) != len(columns):
                print(f"Warning: Column count mismatch in {table_name}: {len(columns)} columns, {len(row_values)} values")
                continue
            
            # Remove backticks and convert MySQL NULL to SQLite NULL
            sqlite_values = []
            for val in row_values:
                val = val.strip()
                val = val.strip('`')
                if val.upper() == 'NULL':
                    sqlite_values.append('NULL')
                else:
                    sqlite_values.append(val)
            
            col_list = ', '.join(f'"{col}"' for col in columns)
            val_list = ', '.join(sqlite_values)
            insert_stmt = f'INSERT INTO {table_name} ({col_list}) VALUES ({val_list});'
            inserts.append(insert_stmt)
    
    return inserts


def import_data():
    """Import data from MySQL dump to SQLite"""
    
    if not IMPORT_FILE.exists():
        print(f"Error: File not found: {IMPORT_FILE}")
        return False
    
    if not DB_PATH.exists():
        print(f"Error: Database not found: {DB_PATH}")
        print("Please initialize the database first by running: python db.py")
        return False
    
    print(f"Reading MySQL dump from: {IMPORT_FILE}")
    inserts = extract_insert_statements(IMPORT_FILE)
    
    print(f"Extracted {len(inserts)} INSERT statements")
    
    if not inserts:
        print("No INSERT statements found in the file")
        return False
    
    # Connect to SQLite database
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Disable foreign keys during import to avoid constraint issues
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        imported_count = 0
        failed_count = 0
        
        for i, stmt in enumerate(inserts, 1):
            try:
                cursor.execute(stmt)
                imported_count += 1
                
                if i % 50 == 0:
                    print(f"  Imported {i}/{len(inserts)} rows...")
                    
            except sqlite3.Error as e:
                error_msg = str(e).lower()
                # Skip unique constraint violations (likely duplicates)
                if 'unique constraint' in error_msg or 'unique violation' in error_msg:
                    pass  # Silently skip
                else:
                    print(f"  Error inserting row {i}: {e}")
                    print(f"  Statement: {stmt[:80]}...")
                failed_count += 1
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        conn.commit()
        conn.close()
        
        print("\n[+] Import completed successfully!")
        print(f"  - {imported_count} rows imported")
        if failed_count > 0:
            print(f"  - {failed_count} rows skipped (duplicates/constraints)")
        
        return True
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return False


if __name__ == "__main__":
    success = import_data()
    exit(0 if success else 1)

