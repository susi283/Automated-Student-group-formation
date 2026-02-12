# Smart Formation API (MERN Backend)

Express + MongoDB backend for the Smart Student Group Formation app.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Set `MONGODB_URI` (default: `mongodb://localhost:27017/smart-formation`)
   - Set `JWT_SECRET` for production
   - Set `GEMINI_API_KEY` for AI group refinement

3. **Start MongoDB** (if running locally)
   - Ensure MongoDB is running on the configured URI

4. **Run the server**
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

## Default Teacher

On first run, a default teacher is created:
- Email: `hitman@gmail.com`
- Password: `hitman123`

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | - | Login |
| POST | /api/auth/register | - | Student registration |
| GET | /api/students | JWT | List students |
| POST | /api/students | JWT (Teacher) | Create student |
| PUT | /api/students/:id | JWT (Teacher) | Update student |
| DELETE | /api/students/:id | JWT (Teacher) | Delete student |
| GET | /api/groups | JWT | List groups |
| POST | /api/groups | JWT (Teacher) | Save groups |
| POST | /api/ai/refine-groups | JWT (Teacher) | AI group analysis |
