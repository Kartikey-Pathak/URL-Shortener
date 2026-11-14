# URL Shortener - Backend API Documentation

Backend service for the URL Shortener application built with Express.js, PostgreSQL (Neon / Drizzle ORM), Nodemailer, and JWT authentication.

## Base URL

- **Local:** `http://localhost:8000`
- **Production:** `https://url-shortener-1-backend.onrender.com`

---

## Authentication

Protected endpoints require a JSON Web Token (JWT) sent in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 1. Health Check

#### `GET /`
Returns server status.

- **Response `200 OK`**:
```json
{
  "message": "Server Says Hello World...!"
}
```

---

### 2. User & Auth Routes (`/user`)

#### `POST /user/signup`
Initiates account registration by generating a 6-digit OTP and sending it via email using Nodemailer. User data is not saved to the database until OTP verification.

- **Request Body**:
```json
{
  "name": "Kartikey Pathak",
  "email": "user@example.com",
  "password": "yourpassword123"
}
```
- **Response `200 OK`**:
```json
{
  "message": "OTP sent successfully. Please check your email.",
  "email": "user@example.com"
}
```
- **Response `400 Bad Request`**:
```json
{
  "error": "Email already registered. Please login instead."
}
```

---

#### `POST /user/verify-otp`
Verifies the 6-digit OTP code. Upon successful verification, creates the user record in PostgreSQL and issues a JWT token.

- **Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```
- **Response `201 Created`**:
```json
{
  "message": "Account verified and registered successfully!",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "759317a9-8a0b-41d2-b528-73950857a243",
    "name": "Kartikey Pathak",
    "email": "user@example.com"
  }
}
```
- **Response `400 Bad Request`**:
```json
{
  "error": "Invalid OTP. Please check your email and try again."
}
```

---

#### `POST /user/resend-otp`
Generates a fresh OTP and resends it to the user's email address.

- **Request Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response `200 OK`**:
```json
{
  "message": "A new OTP has been sent to your email."
}
```

---

#### `POST /user/login`
Authenticates an existing user using email and password.

- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "yourpassword123"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "759317a9-8a0b-41d2-b528-73950857a243",
    "name": "Kartikey Pathak",
    "email": "user@example.com"
  }
}
```
- **Response `400 / 404`**:
```json
{
  "error": "Invalid password."
}
```

---

#### `POST /user/google-auth`
Synchronizes Google OAuth logins with the backend database. If the user does not exist in the database, a record is automatically created with random salt/hash and a JWT token is returned.

- **Request Body**:
```json
{
  "name": "Google User",
  "email": "user@gmail.com"
}
```
- **Response `200 OK`**:
```json
{
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "759317a9-8a0b-41d2-b528-73950857a243",
    "name": "Google User",
    "email": "user@gmail.com"
  }
}
```

---

#### `GET /user/me`
Fetches the profile of the currently authenticated user.

- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "759317a9-8a0b-41d2-b528-73950857a243",
    "name": "Kartikey Pathak",
    "email": "user@example.com",
    "createdAt": "2026-11-13T18:11:44.661Z"
  }
}
```
- **Response `401 Unauthorized`**:
```json
{
  "error": "You Must Be Login"
}
```

---

### 3. URL Routes

#### `POST /shorten`
Shortens a target URL. Accepts an optional custom code (alias). If no custom code is provided, a random 6-character code is generated.

- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "url": "https://example.com/very/long/url",
  "code": "my-custom-link"
}
```
*(Field `code` is optional)*

- **Response `201 Created`**:
```json
{
  "id": "7b4ac0bb-3050-4289-8c67-f9f534a80363",
  "shortCode": "my-custom-link",
  "targetURL": "https://example.com/very/long/url"
}
```
- **Response `400 Bad Request`**:
```json
{
  "error": "Invalid url"
}
```

---

#### `GET /codes`
Retrieves all URLs shortened by the authenticated user.

- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "codes": [
    {
      "id": "7b4ac0bb-3050-4289-8c67-f9f534a80363",
      "shortCode": "bJkUx5",
      "targetURL": "https://example.com/very/long/url",
      "userId": "759317a9-8a0b-41d2-b528-73950857a243",
      "createdAt": "2026-11-13T18:11:44.661Z",
      "updatedAt": "2026-11-13T18:11:44.227Z"
    }
  ]
}
```

---

#### `GET /:shortcode`
Public redirection route. Looks up the target URL by short code and redirects with HTTP 302.

- **Parameters**: `shortcode` (string)
- **Response**: `302 Found` (Redirects to `targetURL`)
- **Response `404 Not Found`**:
```json
{
  "error": "Invalid URL"
}
```

---

#### `DELETE /:id`
Deletes a shortened URL by its ID. Users can only delete their own URLs.

- **Headers**: `Authorization: Bearer <token>`
- **Parameters**: `id` (UUID)
- **Response `201 Created`**:
```json
{
  "delete": true
}
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Port (optional, defaults to 8000)
PORT=8000

# PostgreSQL Connection String (Neon)
DATABASE_URL=postgresql://username:password@endpoint.neon.tech/neondb?sslmode=require

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key

# Nodemailer Credentials (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password
```

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Start production server:
   ```bash
   npm start
   ```
