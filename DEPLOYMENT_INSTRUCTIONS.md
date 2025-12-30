# Deployment Instructions

## The Problem
Vercel is a serverless platform that doesn't support persistent WebSocket connections required by Socket.IO. Your chat app needs a stateful server to maintain real-time connections.

## Solution: Split Deployment

### Frontend (Vercel) - Already Done ✓
Your frontend is deployed on Vercel at: https://open-chat-topaz.vercel.app

### Backend (Render.com) - Follow These Steps:

#### Step 1: Create a Render Account
1. Go to https://render.com
2. Sign up with your GitHub account (same one you used for Vercel)

#### Step 2: Deploy Backend on Render
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (OpenChat)
3. Configure the service:
   - **Name**: `openchat-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: Select "Free" tier

#### Step 3: Get Your Backend URL
After deployment, Render will give you a URL like:
`https://openchat-backend.onrender.com`

#### Step 4: Update Frontend Code
1. In your local code, edit `client/script.js`
2. Find line with `YOUR_BACKEND_URL_HERE`
3. Replace it with your Render URL (e.g., `https://openchat-backend.onrender.com`)

#### Step 5: Push Changes to GitHub
```bash
git add .
git commit -m "Update backend URL for production"
git push
```

Vercel will automatically redeploy your frontend with the new backend URL.

### Alternative: Deploy Backend on Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your OpenChat repository
5. Railway will auto-detect Node.js and deploy
6. Copy the generated URL and update `client/script.js`

## Testing Locally
```bash
# Terminal 1 - Start backend
npm start

# The frontend will connect to localhost:3000
```

## Important Notes
- Free tier on Render may "sleep" after 15 minutes of inactivity
- First connection after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier ($7/month) for always-on service
