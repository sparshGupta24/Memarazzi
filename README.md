
# 🚀 Deploying Meme Mirror AI

This app is ready to be hosted for free on **Vercel**, **Netlify**, or **GitHub Pages**.

## Step 1: Prepare your Gemini API Key
You will need your Google Gemini API key. If you don't have one, get it at [ai.google.dev](https://ai.google.dev/).

## Step 2: Choose a Hosting Provider

### Option A: Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"New Project"**.
3. Import your repository.
4. **CRITICAL**: Under "Environment Variables", add:
   - Key: `API_KEY`
   - Value: `your_gemini_api_key_here`
5. Click **Deploy**.

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com).
2. You can use "Netlify Drop" to drag-and-drop your folder, OR connect your GitHub.
3. In the Site Settings, go to **Environment Variables**.
4. Add `API_KEY` with your Gemini key.

## How it works globally
- **Video Calls**: Uses PeerJS (WebRTC). The STUN servers are configured in `App.tsx` to handle global connections.
- **Deep Linking**: The app uses URL hashes (`#room-id`) to identify private rooms. Anyone with the link will automatically join your session.
- **AI Analysis**: Gemini Flash 2.0 handles the real-time expression tracking.
