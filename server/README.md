# Blog Backend API

NestJS backend server for the blog system.

## Features

- **JWT Authentication**: Secure user registration and login
- **Posts API**: CRUD operations for blog posts with image upload
- **Comments API**: Full CRUD operations for post comments
- **Pagination**: Efficient data loading with offset and limit
- **Image Upload**: Multer-based file handling for post images
- **Swagger Documentation**: Interactive API docs at `/api`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
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

## Run

```bash
# Development mode (watch mode)
npm run start:dev

# Production mode
npm run start:prod
```

Server runs on: `http://localhost:4000`  
API Documentation: `http://localhost:4000/api`
