# Vercel Deployment Guide - AI Nexus Backend

## 🗄️ PostgreSQL Database Options

You need a live PostgreSQL database for production. Here are some of the best PostgreSQL hosting options:

### 1. **Neon (Recommended - Free Tier Available)**
- **Website**: https://neon.tech
- **Database Type**: PostgreSQL (Serverless)
- **Free Tier**: 0.5 GB storage, unlimited projects
- **Setup Steps**:
  1. Create an account on Neon.tech
  2. Create a new project
  3. Copy the connection string (format: `postgres://user:password@host/database?sslmode=require`)
  4. **Note**: Neon automatically provides SSL-enabled PostgreSQL

### 2. **Supabase (Free Tier Available)**
- **Website**: https://supabase.com
- **Database Type**: PostgreSQL
- **Free Tier**: 500 MB database, 2 GB bandwidth
- **Setup Steps**:
  1. Create an account on Supabase.com
  2. Create a new project
  3. Go to Settings > Database > Copy connection string
  4. **Note**: Supabase provides managed PostgreSQL with automatic backups

### 3. **Railway (Free Tier Available)**
- **Website**: https://railway.app
- **Database Type**: PostgreSQL
- **Free Tier**: $5 credit monthly
- **Setup Steps**:
  1. Create an account on Railway.app
  2. New Project > Add PostgreSQL service
  3. Copy connection string from Variables tab
  4. **Note**: Railway provides PostgreSQL with easy scaling

### 4. **Render (Free Tier Available)**
- **Website**: https://render.com
- **Database Type**: PostgreSQL
- **Free Tier**: 90 days free trial
- **Setup Steps**:
  1. Create an account on Render.com
  2. New > PostgreSQL database
  3. Copy connection string (Internal Database URL)
  4. **Note**: Render provides managed PostgreSQL with automatic backups

## 📝 Vercel Environment Variables Setup

Go to Vercel dashboard and add these environment variables:

### Required Variables:

```
JWT_SECRET=0HCuUNNZHfU0e9gC
SMTP_USER=dev4.webbuildinfotech@gmail.com
SMTP_PASS=bnfx bpge wlkg raaz
PORT=3000
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://your-backend-domain.vercel.app
```

### Steps:
1. Go to your project in Vercel dashboard
2. Settings > Environment Variables
3. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Connection string from your database provider (SSL mode required)
   - **Environment**: Production, Preview, Development (add to all)

## 🚀 Deployment Steps

### Step 1: Database Setup
1. Choose one of the database providers mentioned above
2. Create the database
3. Copy the connection string
4. **Important**: Add `?sslmode=require` to the connection string if it's not already there

### Step 2: Local PostgreSQL Database Migration (Optional)
If you want to migrate data from your local PostgreSQL database:
```bash
# Export data from local PostgreSQL database
pg_dump -h localhost -U postgres -d AI-Nexus > backup.sql

# Import into production PostgreSQL database
psql "postgres://user:password@host:port/database?sslmode=require" < backup.sql

# Or with direct connection string:
psql "your-production-database-url" < backup.sql
```

### Step 3: Vercel Deployment
1. Push code to GitHub repository
2. In Vercel dashboard:
   - New Project > Import Git Repository
   - Select Root Directory: `backend`
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add Environment Variables (see above)
4. Deploy

### Step 4: Verify Deployment
1. Check the URL provided by Vercel
2. Health check: `https://your-app.vercel.app/api`
3. Verify database connection

## ⚠️ Important Notes

1. **PostgreSQL SSL Connection**: Production PostgreSQL databases require SSL connection. This is already configured in `app.module.ts`. Make sure to add `?sslmode=require` in the connection string.

2. **Database Synchronize**: Disable `synchronize: true` in production and use TypeORM migrations for security. The code automatically disables it in production mode.

3. **PostgreSQL Connection Pooling**: Connection pooling is important for serverless functions. Most providers (Neon, Supabase) automatically handle this.

4. **Static Files**: If you want to serve assets, use Vercel Blob Storage or Cloudinary (Vercel serverless functions are not ideal for static files).

5. **CORS**: Add your frontend URL in the `FRONTEND_URL` environment variable.

## 🔧 Troubleshooting

### PostgreSQL Database Connection Error
- Verify PostgreSQL connection string (format: `postgres://user:password@host:port/database?sslmode=require`)
- Check SSL mode (`?sslmode=require` is required)
- Verify PostgreSQL database credentials
- Check if database host and port are correct
- Check firewall/network settings (if applicable)
- Check connection logs in database provider dashboard

### Build Errors
- Run `npm install` locally and check for errors
- Fix TypeScript compilation errors
- Add missing dependencies

### Environment Variables Not Working
- Check if variables are properly set in Vercel dashboard
- Redeploy after adding variables
- Variable names are case-sensitive

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/faq/serverless)
- [TypeORM PostgreSQL Configuration](https://typeorm.io/data-source-options#postgres--cockroachdb-data-source-options)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Neon PostgreSQL Docs](https://neon.tech/docs)
- [Supabase PostgreSQL Docs](https://supabase.com/docs/guides/database)
