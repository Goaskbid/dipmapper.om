# DipMapper.com v20.6.0 GitHub + Namecheap deployment guide

This guide is written for a non-developer.

## Files you need

Use `dipmapper_v20_6_0_github_deploy.zip` for GitHub deployment.

Do not upload `dipmapper_v20_6_0_recovery.zip` to GitHub. That file is only for project recovery.

## Part 1. Create the GitHub repository

1. Open GitHub.
2. Sign in.
3. Click the plus button in the top right.
4. Click New repository.
5. Repository name: `dipmapper`.
6. Choose Public or Private.
7. Leave README, license and gitignore unchecked.
8. Click Create repository.

## Part 2. Upload DipMapper

1. Unzip `dipmapper_v20_6_0_github_deploy.zip` on your computer.
2. Open the unzipped folder.
3. Select all files and folders inside it.
4. Go back to your empty GitHub repository.
5. Click uploading an existing file.
6. Drag all selected files into GitHub.
7. Wait until upload is complete.
8. Commit message: `Deploy DipMapper v20.6.0`.
9. Click Commit changes.

## Part 3. Enable GitHub Pages

1. Open the repository on GitHub.
2. Click Settings.
3. Click Pages.
4. Under Build and deployment, select GitHub Actions.
5. Click Actions.
6. Wait until the deployment workflow has a green checkmark.
7. Open the site link GitHub shows you.

## Part 4. Connect dipmapper.com at Namecheap

1. Open Namecheap.
2. Sign in.
3. Go to Domain List.
4. Click Manage next to `dipmapper.com`.
5. Open Advanced DNS.
6. Remove conflicting A, AAAA, CNAME, parking or forwarding records for `@` and `www`.
7. Add these A records for host `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
8. Add a CNAME record:
   - Host: `www`
   - Value: your GitHub Pages hostname, for example `YOUR-GITHUB-USER.github.io`
9. Save all changes.

## Part 5. Set the custom domain in GitHub

1. Go back to GitHub.
2. Open Settings.
3. Open Pages.
4. In Custom domain, enter `dipmapper.com`.
5. Save.
6. Wait for DNS checks.
7. When available, enable Enforce HTTPS.

## Part 6. Test on a phone

Open `https://dipmapper.com` on a real phone and test:

1. Location prompt.
2. Destination search.
3. Map size and sticky behavior.
4. Result list scrolling.
5. Filter visibility.
6. Open details buttons.
7. Numbered map dots.
8. Close button.
9. Privacy notice.
10. Legal links.
11. Ad booking link.

## Current build note

v20.6.0 gives the map more desktop space, anchors it while browsing, narrows the left rail and shortens the result-list viewport.
