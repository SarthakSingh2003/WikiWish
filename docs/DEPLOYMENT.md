# 🚀 WikiWish Deployment Guide (Wikimedia Toolforge & GitHub)

This guide provides step-by-step instructions for deploying WikiWish to **Wikimedia Toolforge** and publishing the source code to **GitHub**.

---

## 📋 Table of Contents
1. [Prerequisites & Architecture](#prerequisites--architecture)
2. [Step 1: Uploading to GitHub](#step-1-uploading-to-github)
3. [Step 2: Registering Wikimedia Production OAuth](#step-2-registering-wikimedia-production-oauth)
4. [Step 3: Setting Up Wikimedia Toolforge](#step-3-setting-up-wikimedia-toolforge)
5. [Step 4: Building & Launching the Web Service](#step-4-building--launching-the-web-service)
6. [Step 5: Verifying & Monitoring](#step-5-verifying--monitoring)
7. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 🏛️ Prerequisites & Architecture

In production on Wikimedia Toolforge:
- **Unified Service**: The backend (Express Node.js) runs on Toolforge's Kubernetes cluster and serves both the API endpoints (`/api/*`) and the pre-built React frontend (`frontend/dist`), eliminating all CORS issues.
- **Toolforge Ingress**: Traefik/Kubernetes ingress handles SSL/HTTPS termination at `https://<toolname>.toolforge.org` and proxies requests internally to your container (default port `8000`).
- **OAuth Callback**: Must match the public Toolforge domain: `https://<toolname>.toolforge.org/api/auth/callback`.

---

## 📦 Step 1: Uploading to GitHub

### 1.1 Verify `.gitignore`
Make sure secrets and dependencies are never committed:
```bash
# Check that .env files and node_modules are ignored
git status
```
*(The repository already includes a strict `.gitignore` covering `.env`, `backend/.env`, and `node_modules`.)*

### 1.2 Initialize Git & Commit
Run the following from the project root (`c:\Users\Asus\StudioProjects\WikiWish`):
```bash
git init
git add .
git commit -m "feat: complete WikiWish platform with OAuth 1.0a, live sync, and responsive UI"
```

### 1.3 Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new) named `WikiWish`.
2. Connect your local repository and push:
```bash
git branch -M main
git remote add origin https://github.com/<your-username>/WikiWish.git
git push -u origin main
```

---

## 🔑 Step 2: Registering Wikimedia Production OAuth

> **Why is a new or updated OAuth consumer required?**  
> Wikimedia OAuth 1.0a strictly validates the **Callback URL**. In local development, it pointed to `http://localhost:8080/api/auth/callback`. For production, it **must** match your Toolforge domain. Registering a dedicated production consumer ensures your local development and live production setups don't conflict.

### 2.1 Propose OAuth Consumer
1. Log in to [Meta-Wiki](https://meta.wikimedia.org/).
2. Navigate to [Special:OAuthConsumerRegistration/propose](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose).
3. Fill in the consumer details:
   - **Consumer name**: `WikiWish (Production)`
   - **OAuth protocol version**: `OAuth 1.0a`
   - **Application description**: `Community-driven discovery, tracking, and curation platform for the Wikimedia Community Wishlist.`
   - **User-visible URL (Application homepage)**: `https://<your-tool-name>.toolforge.org` (e.g. `https://wikiwish.toolforge.org`)
   - **Callback URL**: `https://<your-tool-name>.toolforge.org/api/auth/callback`
   - **Allow consumer to specify a callback in requests**: `No` (or `Yes` for flexibility)
   - **Grants required**:
     - *Basic rights* (`Edit existing pages`, `Create, edit, and move pages`) — required to publish support votes and comments to Meta-Wiki.
4. Submit the proposal.
5. Meta-Wiki will display your **Consumer Key** and **Consumer Secret**. Copy both securely.

---

## 🛠️ Step 3: Setting Up Wikimedia Toolforge

### 3.1 Connect to Toolforge Bastion
Open your terminal (or PowerShell) and SSH into the Toolforge login bastion using your Wikimedia developer credentials:
```bash
ssh <your-developer-username>@login.toolforge.org
```

### 3.2 Switch to Your Tool Account
```bash
become <your-tool-name>
```
*(If you haven't created your tool yet, visit [wikitech.wikimedia.org/wiki/Help:Toolforge/Tools](https://wikitech.wikimedia.org/wiki/Help:Toolforge/Tools) to register `<your-tool-name>`.)*

### 3.3 Clone the Repository
Inside your tool's home directory (`/data/project/<your-tool-name>`):
```bash
git clone https://github.com/<your-username>/WikiWish.git src
cd src
```

### 3.4 Configure Production Environment Variables
Create the production environment file:
```bash
cp backend/.env.example backend/.env
nano backend/.env
```
Fill in the production values:
```env
NODE_ENV=production
PORT=8000

# Production OAuth credentials from Meta-Wiki
OAUTH_CONSUMER_KEY=your_production_consumer_key
OAUTH_CONSUMER_SECRET=your_production_consumer_secret
OAUTH_CALLBACK_URL=https://<your-tool-name>.toolforge.org/api/auth/callback

# URLs & Secrets
FRONTEND_URL=https://<your-tool-name>.toolforge.org
SESSION_SECRET=<generate using: openssl rand -hex 32>
CORS_ORIGINS=https://<your-tool-name>.toolforge.org
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 🚀 Step 4: Building & Launching the Web Service

### 4.1 Install Dependencies & Build
Run the unified build command to build both the Vite frontend and the TypeScript backend:
```bash
# Install dependencies
npm install --prefix backend
npm install --prefix frontend

# Build frontend and backend
npm run build
```

### 4.2 Start the Modern Kubernetes Webservice
Launch the service using modern Toolforge Kubernetes:
```bash
toolforge webservice --backend=kubernetes node20 start --port 8000
```
*(Alternatively: `webservice --backend=kubernetes node20 start`)*

### 4.3 Check Web Service Status
```bash
toolforge webservice status
```
Output will indicate: `Your webservice is running.`

---

## 🔍 Step 5: Verifying & Monitoring

1. **Open your browser** and navigate to:
   `https://<your-tool-name>.toolforge.org`
2. **Verify Health Endpoint**:
   `https://<your-tool-name>.toolforge.org/health` (should return `{"status":"healthy",...}`)
3. **Verify OAuth Sign-in**:
   - Click **Sign in with Wikimedia** in the top navigation.
   - Authorize on Meta-Wiki.
   - You should be redirected back to `https://<your-tool-name>.toolforge.org/dashboard` with your username displayed.
4. **View Real-Time Logs**:
   ```bash
   toolforge webservice logs -f
   ```

---

## 💡 Troubleshooting & FAQs

- **Q: My OAuth returns "callback_url_not_approved" or fails during redirect?**  
  *A:* Double-check that the `OAUTH_CALLBACK_URL` in `backend/.env` matches **character-for-character** with the Callback URL registered in `Special:OAuthConsumerRegistration`. Ensure it starts with `https://` and includes `/api/auth/callback`.

- **Q: Why was `trust proxy` enabled in Express?**  
  *A:* Toolforge uses Kubernetes Ingress with reverse-proxy SSL termination. `app.set('trust proxy', 1)` allows Express and `express-session` to recognize secure HTTPS cookies behind the proxy.

- **Q: How do I deploy code updates in the future?**  
  *A:* Simply SSH into Toolforge, run:
  ```bash
  become <your-tool-name>
  cd src
  git pull origin main
  npm run build
  toolforge webservice restart
  ```
