# DipMapper.com GitHub + Namecheap deployment guide

This is written for a first-time user.

## Part 1 - Create the GitHub repository

1. Sign in to GitHub.
2. Click the `+` button in the top right.
3. Click `New repository`.
4. Repository name: `dipmapper`.
5. Choose `Public` unless you have a paid plan that supports private Pages deployment.
6. Do not add a README, license, or gitignore.
7. Click `Create repository`.

## Part 2 - Upload the deployment ZIP

1. Download `dipmapper_v20_0_0_github_deploy.zip`.
2. Unzip it on your computer.
3. Open the new GitHub repository.
4. Click `uploading an existing file`.
5. Drag all files from the unzipped folder into GitHub.
6. Click `Commit changes`.

## Part 3 - Turn on GitHub Pages

1. In the repository, click `Settings`.
2. Click `Pages` in the left menu.
3. Under `Build and deployment`, choose `GitHub Actions`.
4. Click the `Actions` tab.
5. Wait for a green checkmark.
6. Open the temporary GitHub Pages URL and test the website.

## Part 4 - Connect dipmapper.com at Namecheap

1. Sign in to Namecheap.
2. Go to `Domain List`.
3. Click `Manage` beside `dipmapper.com`.
4. Go to `Advanced DNS`.
5. Remove conflicting A, CNAME, URL Redirect or parking records for `@` and `www`.
6. Add these A records for host `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
7. Add this CNAME record:
   - Host: `www`
   - Value: `YOUR-GITHUB-USERNAME.github.io`
8. Save all changes.

## Part 5 - Add the custom domain in GitHub

1. Go back to GitHub repository `Settings`.
2. Click `Pages`.
3. In `Custom domain`, enter `dipmapper.com`.
4. Save.
5. Wait for DNS checks to pass.
6. Enable `Enforce HTTPS` when GitHub allows it.

## Part 6 - Test before launch

Test on iPhone and Android:

- location permission
- search around current location
- search for Meilen, Zurich, Rhodes, Palma, Rostock, Miami
- result card opens from the list
- result card opens from numbered map dots
- Quiet now filter
- photo gallery
- parking routes
- privacy/cookie/disclaimer links
- advertiser email link

## If something fails

- Wait up to 24 hours for DNS propagation.
- Check GitHub Actions for red errors.
- Make sure the repository root contains `CNAME` with `dipmapper.com`.
- Make sure Namecheap has no conflicting records for `@` or `www`.
