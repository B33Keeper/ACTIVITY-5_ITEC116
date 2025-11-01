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

## Using Swagger

### Step 1: Open Swagger
1. Start the server: `npm run start:dev`
2. Open browser: `http://localhost:4000/api`

### Step 2: Get JWT Token (Required for Protected Endpoints)

#### Login First:
1. Find **`POST /auth/login`** endpoint
2. Click "Try it out"
3. In the **Request body** text box, paste:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
4. Click "Execute"
5. **Copy the `access_token`** from the response (e.g., `eyJhbGciOiJIUzI1NiIs...`)

### Step 3: Authorize (For Protected Endpoints)
1. Click the **"Authorize"** button (top right, lock icon 🔒)
2. In the "Value" field, paste your token in this format:
```
Bearer eyJhbGciOiJIUzI1NiIs...
```
3. Click "Authorize", then "Close"

### Step 4: Test Endpoints

#### Auth - Register
1. Find **`POST /auth/register`**
2. Click "Try it out"
3. In **Request body** box, paste:
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```
4. Click "Execute"

#### Posts - Create Post
1. Find **`POST /posts`** (requires authorization)
2. Click "Try it out"
3. In the form fields, fill:
   - **title**: `My First Post`
   - **content**: `This is the content of my post`
   - **image**: Click "Choose File" and select an image (JPG/PNG/GIF/WEBP, max 5MB)
4. Click "Execute"

#### Posts - Update Post
1. Find **`PUT /posts/{id}`** (replace `{id}` with post ID, e.g., `1`)
2. Click "Try it out"
3. Fill form fields:
   - **title**: `Updated Post Title`
   - **content**: `Updated content here`
   - **image**: (optional) Click "Choose File" to upload new image
   - **imageUrl**: (optional) `/uploads/old-image.jpg` to keep existing image
4. Click "Execute"

#### Comments - Create Comment
1. Find **`POST /comments`** (requires authorization)
2. Click "Try it out"
3. In **Request body** box, paste:
```json
{
  "content": "Great post!",
  "postId": 1
}
```
4. Click "Execute"

#### Comments - Update Comment
1. Find **`PUT /comments/{id}`** (replace `{id}` with comment ID)
2. Click "Try it out"
3. In **Request body** box, paste:
```json
{
  "content": "Updated comment text"
}
```
4. Click "Execute"

#### Users - Get My Profile
1. Find **`GET /users/profile/me`** (requires authorization)
2. Click "Try it out"
3. Click "Execute"

#### Users - Update Profile
1. Find **`PUT /users/profile`** (requires authorization)
2. Click "Try it out"
3. In the form fields, fill:
   - **username**: `newusername`
   - **email**: `newemail@example.com`
   - **password**: `newpassword123` (new password)
   - **currentPassword**: `oldpassword123` (your current password)
   - **profilePicture**: Click "Choose File" to upload profile picture
4. Click "Execute"

### Quick Reference

- **Request body** = Large text box below "Parameters"
- **Form fields** = Individual input boxes for multipart/form-data
- **Query params** = Add in the "Parameters" section (e.g., `offset=0`, `limit=10`)
- **Path params** = Replace `{id}` in URL with actual ID number
