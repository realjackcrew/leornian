# Render Deployment Setup Guide

## Required Environment Variables

You need to set the following environment variables in your Render dashboard:

### 1. Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database_name
```
- This should be your PostgreSQL connection string
- If you're using Render's PostgreSQL service, it will provide this URL

### 2. JWT Secret (Required)
```
JWT_SECRET=your-super-secure-random-string-here
```
- Generate a secure random string (at least 32 characters)
- You can use: `openssl rand -base64 32` to generate one

### 3. Client URL for CORS
```
CLIENT_URL=https://leo.jackcrew.net
```

## Optional Environment Variables

### 4. Google OAuth (if using Google Sign-In)
```
GOOGLE_CLIENT_ID=your-google-client-id
```

### 5. OpenAI API (for chat functionality)
```
OPENAI_API_KEY=your-openai-api-key
```

### 6. WHOOP Integration
```
WHOOP_CLIENT_ID=your-whoop-client-id
WHOOP_CLIENT_SECRET=your-whoop-client-secret
WHOOP_REDIRECT_URI=https://leo.jackcrew.net/whoop-callback
```

## How to Set Environment Variables on Render

1. Go to your Render dashboard
2. Select your service (leornian-server)
3. Go to the "Environment" tab
4. Add each variable with its corresponding value
5. Save the changes
6. Redeploy the service

## Database Setup

If you haven't set up a database yet:

1. Create a new PostgreSQL service on Render
2. Copy the provided `DATABASE_URL`
3. Set it as an environment variable in your web service
4. The Prisma migrations will run automatically on deployment

## Testing the Setup

After setting the environment variables and redeploying:

1. Check the server logs in Render dashboard
2. Try registering a new user
3. Check for any error messages in the logs

## Common Issues

- **500 Error**: Usually means missing `DATABASE_URL` or `JWT_SECRET`
- **CORS Error**: Make sure `CLIENT_URL` is set correctly
- **Database Connection**: Ensure the database is accessible from your web service 