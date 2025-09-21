@echo off
REM Database setup script for Club 90s Football Academy (Windows)
REM This script initializes the PostgreSQL database with the required schema

setlocal enabledelayedexpansion

REM Database configuration
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=Club90sFA
if "%DB_USER%"=="" set DB_USER=postgres
if "%DB_PASSWORD%"=="" set DB_PASSWORD=nintendo11

echo Setting up Club 90s Football Academy Database...

REM Check if PostgreSQL is running
pg_isready -h %DB_HOST% -p %DB_PORT% -U %DB_USER% >nul 2>&1
if errorlevel 1 (
    echo Error: PostgreSQL is not running or not accessible
    pause
    exit /b 1
)

REM Create database if it doesn't exist
echo Creating database if it doesn't exist...
set PGPASSWORD=%DB_PASSWORD%
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME% 2>nul

REM Run the schema migration
echo Running database migrations...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f schema.sql

echo Database setup completed successfully!
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo User: %DB_USER%
echo.
echo Default admin credentials:
echo Email: admin@club90s.com
echo Password: admin123!
echo.
echo WARNING: Change the default admin password after first login!
pause