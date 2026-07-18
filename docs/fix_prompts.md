User: Write a .gitignore for each file based on the standard gitignore 

---
Model:The backend .gitignore had a copy-paste issue. Let me fix it.

Done. Created 3 .gitignore files:

Root — Node modules, env files, IDE configs, OS files, logs, Docker
backend/ — Node modules, dist/, env files, Prisma db files, coverage
frontend/ — Node modules, dist/, env files, IDE configs

---
User: Add a .env.example in each (frontend and backend)

---
Done. Created:

backend/.env.example — DATABASE_URL, JWT_SECRET, PORT (mirrors the real .env with safe placeholder values)
frontend/.env.example — VITE_API_URL (commented out, ready for use if needed)