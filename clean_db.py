import psycopg2
from psycopg2 import sql
import os
import shutil

# Configuration - Adjusted based on your AppHost.cs
DB_CONFIG = {
    "dbname": "docketdb",
    "user": "postgres",
    "password": "xVAh2S*pudwSDF9P*M7Dg6", # Replace with your actual Aspire password if different
    "host": "localhost",
    "port": "5433"
}

# Tables in order of deletion to avoid Foreign Key constraint violations
# (Child tables first, then Parent tables)
TABLES_TO_CLEAN = [
    "ArchivedDocuments", 
    "Folders", 
    "Trays", 
    "TenantMemberships", 
    "Tenants", 
    "Users"
]

# Path to the uploads folder based on your project structure
UPLOADS_DIR = r"C:\Users\pnirw\Documents\Docket\Docket\Docket.Api\uploads"

def clean_database():
    print("--- Database Cleaning Started ---")
    conn = None
    try:
        # Connect to the database
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()

        for table in TABLES_TO_CLEAN:
            print(f"Cleaning table: {table}...")
            # Use TRUNCATE with CASCADE to ensure all related data is removed
            cur.execute(sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(sql.Identifier(table)))
        
        print("Successfully cleaned all database tables.")
    except Exception as e:
        print(f"Error cleaning database: {e}")
    finally:
        if conn:
            conn.close()

def clean_uploads():
    print("\n--- Uploads Directory Cleaning Started ---")
    if os.path.exists(UPLOADS_DIR):
        try:
            for item in os.listdir(UPLOADS_DIR):
                item_path = os.path.join(UPLOADS_DIR, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
            print(f"Successfully cleaned uploads directory: {UPLOADS_DIR}")
        except Exception as e:
            print(f"Error cleaning uploads directory: {e}")
    else:
        print("Uploads directory not found, skipping.")

if __name__ == "__main__":
    # Warning to user
    confirm = input("This will PERMANENTLY delete all data in the database and the uploads folder. Continue? (y/N): ")
    if confirm.lower() == 'y':
        clean_database()
        clean_uploads()
        print("\nProject environment cleaned successfully.")
    else:
        print("Cleanup cancelled.")
