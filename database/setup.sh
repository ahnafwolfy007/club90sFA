#!/bin/bash

# Database setup script for Club 90s Football Academy
# This script initializes the PostgreSQL database with the required schema

set -e

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-Club90sFA}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-nintendo11}

echo "Setting up Club 90s Football Academy Database..."

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "Error: PostgreSQL is not running or not accessible"
    exit 1
fi

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true

# Run the schema migration
echo "Running database migrations..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

echo "Database setup completed successfully!"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""
echo "Default admin credentials:"
echo "Email: admin@club90s.com"
echo "Password: admin123!"
echo ""
echo "⚠️  IMPORTANT: Change the default admin password after first login!"