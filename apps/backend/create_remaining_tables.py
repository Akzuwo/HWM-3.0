#!/usr/bin/env python3
"""Create missing tables with proper schema"""

import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data" / "hwm.sqlite"


def create_tables():
    """Create tables that the dump references but don't have proper PRIMARY KEY"""
    
    if not DB_PATH.exists():
        print(f"Error: Database not found: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check which tables already exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    existing = {row[0] for row in cursor.fetchall()}
    
    tables_to_create = []
    
    # aufgaben table
    if 'aufgaben' not in existing:
        tables_to_create.append((
            'aufgaben',
            '''CREATE TABLE aufgaben (
                id INTEGER PRIMARY KEY,
                typ TEXT NOT NULL,
                klasse TEXT DEFAULT 'all',
                fachkuerzel TEXT NOT NULL,
                beschreibung TEXT NOT NULL,
                faellig_am TEXT NOT NULL
            )'''
        ))
    
    # hausaufgaben table
    if 'hausaufgaben' not in existing:
        tables_to_create.append((
            'hausaufgaben',
            '''CREATE TABLE hausaufgaben (
                id INTEGER PRIMARY KEY,
                klasse TEXT NOT NULL,
                fach TEXT NOT NULL,
                aufgabe TEXT NOT NULL,
                faellig_am TEXT NOT NULL
            )'''
        ))
    
    # pruefungen table - with correct schema from dump
    if 'pruefungen' not in existing:
        tables_to_create.append((
            'pruefungen',
            '''CREATE TABLE pruefungen (
                id INTEGER PRIMARY KEY,
                fachkuerzel TEXT,
                beschreibung TEXT,
                pruefungsdatum TEXT
            )'''
        ))
    
    # reports table - with correct schema from dump
    if 'reports' not in existing:
        tables_to_create.append((
            'reports',
            '''CREATE TABLE reports (
                id INTEGER PRIMARY KEY,
                player_uuid TEXT NOT NULL,
                reporter_name TEXT NOT NULL,
                reason TEXT NOT NULL,
                timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'offen',
                assigned_staff TEXT,
                notes TEXT DEFAULT '',
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )'''
        ))
    
    # special_events table
    if 'special_events' not in existing:
        tables_to_create.append((
            'special_events',
            '''CREATE TABLE special_events (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT
            )'''
        ))
    
    # eintraege table (legacy, might not be imported but needs structure)
    if 'eintraege' not in existing:
        tables_to_create.append((
            'eintraege',
            '''CREATE TABLE eintraege (
                id INTEGER PRIMARY KEY,
                class_id TEXT NOT NULL DEFAULT 'L23a',
                beschreibung TEXT NOT NULL,
                datum TEXT NOT NULL,
                enddatum TEXT,
                startzeit TEXT,
                endzeit TEXT,
                typ TEXT NOT NULL,
                fach TEXT DEFAULT '',
                owner_user_id INTEGER,
                is_private INTEGER DEFAULT 0,
                is_done INTEGER DEFAULT 0,
                todo_status TEXT
            )'''
        ))
    
    # Create the tables
    for table_name, create_sql in tables_to_create:
        try:
            cursor.execute(create_sql)
            print(f"[+] Created table: {table_name}")
        except sqlite3.Error as e:
            print(f"[-] Error creating {table_name}: {e}")
    
    conn.commit()
    conn.close()
    
    print("\n[+] All missing tables created!")
    return True


if __name__ == "__main__":
    create_tables()

