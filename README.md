# Blog System

A modern blog application with authentication, posts, comments, and image uploads.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Posts**: Create, read, update, and delete blog posts
- **Image Upload**: Instagram-style image upload for posts
- **Comments**: Add, edit, and delete comments on posts
- **Modern UI**: Minimalist design with responsive layout
- **Full-screen Hero**: Beautiful header with dynamic navbar
- **Pagination**: Efficient post loading with pagination support
- **Swagger API Docs**: Interactive API documentation

## Tech Stack

- **Backend**: NestJS (TypeScript), TypeORM, MySQL
- **Frontend**: React
- **Database**: MySQL

## Setup

1. **Database**: Create database `blog_db` in MySQL
2. **Environment Variables**: Create `.env` file in `server/` folder:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASS=
   DB_NAME=blog_db
   JWT_SECRET=supersecretjwt
   JWT_EXPIRES=1d
   PORT=4000
   ```

## Run Commands

### Backend (Server)
```bash
cd server
npm install
npm run start:dev
```
Backend runs on: `http://localhost:4000`  
API Docs: `http://localhost:4000/api`

### Frontend (Client)
```bash
cd client
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Register a new account or login
3. Create posts with optional images
4. Comment on posts
5. Edit/delete your own posts and comments
