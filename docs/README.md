# EPTSS Documentation

This directory contains essential architecture and best practices documentation for the EPTSS (Everyone Plays the Same Song) project.

## Files

### 📐 Architecture

**[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** (10KB) - **START HERE!**
The main architectural reference for the project. Covers:
- The layered architecture pattern (Data Access → Providers → Actions → Pages → Components)
- Where code belongs and why
- Common patterns and troubleshooting
- Next.js 15 App Router best practices specific to this project
- Current compliance status and quick wins

This is your **single source of truth** for architectural decisions.

---

### 🔍 Zod & Validation

**[ZOD_FORMDATA_GUIDE.md](./ZOD_FORMDATA_GUIDE.md)** (7.4KB)
Best practices for using Zod with FormData in Server Actions:
- Why use Zod for FormData validation
- The standard pattern to follow
- Common patterns (optional fields, transformations, custom validation)
- Where to use Zod (and where not to)
- Migration checklist from manual extraction
- Real examples from the codebase

---

### 🛠️ Setup & Operations

**[ENV_SETUP.md](./ENV_SETUP.md)** (3.8KB)
Environment variables and operational setup:
- Required environment variables
- Cron job secrets
- Deployment environment configuration
- Authentication setup

### 📚 Reference

**[nextjs-idea.md](./nextjs-idea.md)** (51KB)
Comprehensive Next.js 15 App Router reference (not project-specific):
- Core architectural principles
- App Router paradigm shift
- Breaking changes in Next.js 15
- Server Components vs Client Components
- Caching strategies
- General Next.js patterns

Keep this as general reference material for Next.js 15 concepts.

---

## Quick Reference

### "Where should this code go?"
→ See **ARCHITECTURE_GUIDE.md** - Quick Reference table

### "How do I validate FormData?"
→ See **ZOD_FORMDATA_GUIDE.md** - The Pattern section

### "What are the architecture rules?"
→ See **ARCHITECTURE_GUIDE.md** - TL;DR section (first page)

### "How does Next.js 15 work?"
→ See **nextjs-idea.md** for general Next.js concepts

---

---

## Maintenance

**When to update these docs:**
- Architecture changes → update ARCHITECTURE_GUIDE.md
- New validation patterns → update ZOD_FORMDATA_GUIDE.md
- Next.js version upgrade → consider updating nextjs-idea.md

**What NOT to document here:**
- API endpoints (use OpenAPI/Swagger)
- Database schema (use migrations/schema files)
- Environment variables (use .env.example)
- Deployment process (use separate deployment docs)
