# DipMapper.com GitHub and Namecheap deployment guide

Project: DipMapper.com
Version: v20.2.0
Date: 2026-05-15
Time: 23:05 CEST

This is the beginner deployment guide for publishing DipMapper.com on GitHub Pages with a Namecheap domain.

## 1. Create the GitHub repository

1. Sign in to GitHub.
2. Click the plus button in the top right.
3. Click New repository.
4. Name it `dipmapper`.
5. Leave it empty. Do not add a README because this package already includes one.
6. Click Create repository.

## 2. Upload the website files

1. Download `dipmapper_v20_2_0_github_deploy.zip`.
2. Unzip it.
3. Open the unzipped folder.
4. In GitHub, click Add file.
5. Click Upload files.
6. Drag every file and folder from the unzipped package into GitHub.
7. Commit message: `Deploy DipMapper v20.2.0`.
8. Click Commit changes.

## 3. Enable GitHub Pages

1. Open repository Settings.
2. Click Pages.
3. Under Build and deployment, choose GitHub Actions.
4. Open the Actions tab.
5. Wait for the workflow to finish with a green check.
6. Open the temporary GitHub Pages URL and test the site.

## 4. Add the custom domain

1. Go to Settings.
2. Click Pages.
3. Enter `dipmapper.com` in Custom domain.
4. Click Save.
5. Keep the included `CNAME` file. It already contains `dipmapper.com`.

## 5. Configure Namecheap DNS

1. Sign in to Namecheap.
2. Go to Domain List.
3. Click Manage next to `dipmapper.com`.
4. Open Advanced DNS.
5. Remove conflicting records for `@` and `www`.
6. Add these records:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |
| CNAME Record | www | YOUR-GITHUB-USERNAME.github.io | Automatic |

Replace `YOUR-GITHUB-USERNAME` with your GitHub username or organization.

## 6. Wait and enable HTTPS

1. Wait at least 30 minutes.
2. In GitHub Settings, Pages, wait until the custom domain check passes.
3. Enable Enforce HTTPS when GitHub allows it.
4. Test `https://dipmapper.com` and `https://www.dipmapper.com`.

## 7. Phone test

Use a real phone. Test:

1. Vertical scrolling on the result list.
2. Small scroll gestures over cards do not open cards.
3. Deliberate taps open result cards.
4. Numbered map dots open cards.
5. Close button remains visible while a long card is open.
6. Filters are all visible on mobile.
7. Location search.
8. Destination search.
9. Privacy, cookies and disclaimer links.

## 8. Updating later

For the next export, upload the new GitHub deployment ZIP contents to the same repository and commit the new version.
