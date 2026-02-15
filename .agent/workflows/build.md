### 1. GitHub Repository Setup
To allow electron-updater to find your updates, your GitHub repository must be public (or you need to configure a private token, but public is standard for auto-updates).

- Personal Access Token (Required for Publishing) :
  1. Go to GitHub Settings > Developer Settings > Personal Access Tokens (Tokens classic) .
  2. Generate a new token with repo scope.
  3. Copy this token. You will need it to upload your builds.
### 2. The Workflow: How to Release an Update
Every time you want to push an update to your users, follow these steps exactly:
 Step A: Update the Version
In your package.json , increase the version number (e.g., from 3.2.0 to 3.3.0 ). The auto-updater only triggers if the GitHub version is higher than the installed version.
 Step B: Build and Publish
Run the following command in your terminal. You must provide your GitHub token so the script has permission to create a release:

```
# In PowerShell
$env:GH_TOKEN="your_github_token_her
e"
npm run publish
```
What happens when you run this?
- Electron Builder compiles your code.
- It creates the .exe installer.
- Crucially , it creates a file named latest.yml . This file contains the version number and the "hash" (fingerprint) of the installer.
- It automatically creates a Draft Release on GitHub and uploads these files. Step C: Make the Release Public
1. Go to your GitHub repo's Releases page.
2. You will see a new "Draft" release.
3. Edit the release, add your patch notes, and click Publish Release .
4. Auto-update is now live! Within an hour (or on next launch), all your users' apps will detect this and start downloading.
### 3. Important "Must-Dos" Code Signing (The "Blue Box" Warning)
Windows will show a "Windows protected your PC" warning (SmartScreen) when users run your installer because it isn't "Signed" with a paid certificate ( [ o bj ec tO bj ec t ] 200 − 400/year).

- The Good News : Auto-updates still work without a certificate.
- The Catch : The first time a user installs, they have to click "More Info" -> "Run Anyway". Once your app gains "reputation" on enough PCs, the warning eventually goes away for that specific version. The latest.yml File
Never manually delete or skip uploading the latest.yml file to your GitHub release. If that file is missing, the app will never know an update exists.

### 4. Summary of your New Commands
I have configured these specifically in your package.json :

- npm run build : Test the build locally.
- npm run dist : Create the installer in the dist/ folder (useful for manual testing).
- npm run publish : The "Magic Button" that builds and sends everything to GitHub.
### 5. Troubleshooting Tips
- Check the Logs : If updates aren't working, check the main process logs. electron-updater logs errors there.
- Version Mismatch : Ensure your package.json version matches your GitHub tag version exactly.
- AppId Consistency : Never change the appId ( com.ali120b.island ) in your package.json . If you change it, Windows will treat the update as a completely different app and won't replace the old one.
