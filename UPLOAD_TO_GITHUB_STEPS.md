# Upload this DrawStar folder to GitHub and Google AI Studio

Use this folder as the project. Do not upload the ZIP or the `remake-nov-19` folder.

## 1. Create the GitHub repository

1. Sign in to GitHub in Brave.
2. Open https://github.com/new
3. Repository name: `drawstar-football`
4. Set visibility to **Private**.
5. Leave **Add a README**, `.gitignore`, and license turned off/at “No”. This folder already contains these project files.
6. Click **Create repository**.

If GitHub already created `Hisyaz/drawstar-football`, open that repository instead of making another one.

## 2. Open a terminal in the correct folder

In File Explorer, open `DrawStar-GitHub-Upload`. Right-click an empty area in the folder and choose **Open in Terminal**. The terminal path should end with `DrawStar-GitHub-Upload`.

## 3. Upload the project

On the repository page, click **Code**, copy the HTTPS URL, then run these commands in the terminal one at a time. Replace the URL below with the one you copied if it differs.

```powershell
git init -b main
git add .
git status --short
git commit -m "Add DrawStar project and gameplay updates"
git remote add origin https://github.com/Hisyaz/drawstar-football.git
git push -u origin main
```

If Git says `Author identity unknown`, set your name and GitHub email (use the same email configured in GitHub), then retry the commit:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your-github-email@example.com"
git commit -m "Add DrawStar project and gameplay updates"
```

If the push opens a browser sign-in/authorization flow, complete it yourself. Never paste a password or access token into chat.

## 4. Import into Google AI Studio

1. Open Google AI Studio **Build** mode.
2. In the prompt area, click **+** → **Import from GitHub**.
3. Authorize Google AI Studio to access the private repository if asked.
4. Select `Hisyaz/drawstar-football` and import it.

The folder intentionally excludes `node_modules`, generated `dist`/build output, and real `.env` files. The `.env.example` template is included. For local development, install dependencies with `npm install`.
