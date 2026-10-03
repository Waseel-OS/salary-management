# Salary Management System

This project runs as a Java web app with a MySQL database and serves the frontend from the project root.

## Requirements
- Java 11+
- Maven
- MySQL 8

## Setup
1. Start MySQL and create the database:
   ```sql
   CREATE DATABASE app_db;
   ```
2. Import the schema and sample data:
   ```bash
   mysql -u root -p app_db < schema.sql
   ```
   If your MySQL username/password is different, update the values in `backend/database/db.properties`.
3. Check the database settings in `backend/database/db.properties`:
   ```properties
   db.url=jdbc:mysql://localhost:3306/app_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   db.username=root
   db.password=root
   server.port=8080
   ```

## Run the app
From the project root:

```bash
cd backend
mvn clean package
java -jar target/salary-management-backend-1.0.0-jar-with-dependencies.jar
```

Then open:

```text
http://localhost:8080
```

You can also run it directly with Maven:

```bash
cd backend
mvn exec:java
```

## Default login
- Username: `admin`
- Password: `admin123`

> If port 8080 is already in use, change `server.port` in `backend/database/db.properties` and restart the app.
