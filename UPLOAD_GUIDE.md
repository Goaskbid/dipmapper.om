# How to put DipMapper 23.8 on GitHub

This guide uses only the GitHub website, with no programs to install. You need to be signed in to GitHub with the account that owns `Goaskbid/dipmapper.om`.

Unzip `DipMapper_GitHub_v23_8.zip` first. You will see two folders and this guide:

| Folder | Where it goes |
|---|---|
| `1_website-repo` | Your **existing** website repository `Goaskbid/dipmapper.om` (this is what dipmapper.com shows) |
| `2_source-repo` | A **new private** repository for the build sources, tests and documents (recommended, optional) |

## Part 1: Update the live website (one file per commit)

You only upload the files that changed. Uploading them one by one keeps every change small and easy to undo.

**Files that changed since 23.8.0 (and since 23.7 and 23.6):**
- `index.html` (the app, version 23.8.1; the About photos are built into it)
- `CHANGELOG.md` (updated)

No other website file changed. If 23.6 was never uploaded, also upload `manifest.webmanifest` and `README.md`. If something even older is live, `1_website-repo/UPLOAD_ORDER.txt` lists the complete order.

**For each file:**
1. Open <https://github.com/Goaskbid/dipmapper.om>.
2. Click **Add file → Upload files**.
3. Drag **one** file from the `1_website-repo` folder into the page.
4. Under *Commit changes*, write a short message, e.g. `DipMapper 23.8.1 – index.html`.
5. Leave **Commit directly to the main branch** selected and click **Commit changes**.
6. Wait until the file appears in the list, then continue with the next file.

**Check that it worked:**
- GitHub Pages needs 1–3 minutes after the last commit.
- Scroll below the swim guides: the **About DipMapper** section with the full interview and all three photos must appear. On a PC, the **About** button in the header jumps there.
- Open <https://dipmapper.com>, reload fully (on a phone: close the tab and open it again) and scroll to the very bottom. It must say **DipMapper version 23.8.1**.
- If something looks wrong, open the file on GitHub → **History** → choose the previous version → **Revert**. Or simply upload the 23.7 `index.html` again.

## Part 2: Create the private source repository (optional, recommended)

This keeps the build sources, tests and documents safe and versioned, separately from the public website.

1. Open <https://github.com/new>.
2. **Repository name:** `dipmapper-source`. **Visibility: Private.** Leave "Add a README" **unticked**, because the folder already has one.
3. Click **Create repository**.
4. On the empty repository page, click the link **uploading an existing file**.
5. Open the `2_source-repo` folder on your computer, select **everything inside it**, and drag it into the page. Folders keep their structure.
   - GitHub accepts up to 100 files per upload. If it refuses, upload the folders one at a time in this order: `website`, `tools`, `docs`, then the remaining files.
6. Commit message: `DipMapper 23.8.1 source`, then click **Commit changes**.
7. The hidden file `.gitignore` may not be picked up by drag-and-drop on some computers. If it is missing, click **Add file → Create new file**, name it `.gitignore`, paste the contents of `2_source-repo/gitignore.txt`, and commit.

**If you already created `dipmapper-source` for 23.6 or 23.7:** open it, click **Add file → Upload files**, drag in the folders `tools` and `docs`, and the files `README.md` and `CHANGELOG.md` from `2_source-repo`, commit with `DipMapper 23.8.1 source`. Then upload `website/index.html` the same way into the `website` folder of that repository.

## Safety notes

- Nothing in either folder contains a password, token or private key.
- The website repository stays public, because GitHub Pages needs that on free accounts. The source repository should be **private**.
- Never upload `node_modules` or test screenshots. They are not in the folders, and `.gitignore` blocks them.
