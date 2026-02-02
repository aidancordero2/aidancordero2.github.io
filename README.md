# Aidan Cordero Lab Website

A professional research lab website for the Aidan Cordero Lab, focusing on genotype-phenotype modeling.

## Files Included

- `index.html` - Homepage
- `team.html` - Team members page
- `research.html` - Research areas and publications
- `contact.html` - Contact information
- `styles.css` - Main stylesheet
- `team.css` - Team page styles
- `research.css` - Research page styles
- `contact.css` - Contact page styles
- `script.js` - JavaScript for animations and interactions

## How to Upload to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and log in
2. Click the **+** button in the top right and select "New repository"
3. Name your repository: `username.github.io` (replace `username` with your actual GitHub username)
   - Example: If your username is `johndoe`, name it `johndoe.github.io`
4. Make sure the repository is **Public**
5. Check "Add a README file" (optional)
6. Click **Create repository**

### Step 2: Upload Your Website Files

**Option A: Using the Web Interface (Easiest)**

1. In your new repository, click **Add file** → **Upload files**
2. Drag and drop ALL the website files into the upload area:
   - index.html
   - team.html
   - research.html
   - contact.html
   - styles.css
   - team.css
   - research.css
   - contact.css
   - script.js
3. Add a commit message like "Add website files"
4. Click **Commit changes**

**Option B: Using Git (If you're comfortable with command line)**

```bash
# Clone your repository
git clone https://github.com/username/username.github.io.git
cd username.github.io

# Copy all website files into this folder
# Then:
git add .
git commit -m "Add website files"
git push
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon at the top)
3. In the left sidebar, click **Pages**
4. Under "Source", select **main** branch (or **master** if that's what you have)
5. Click **Save**

### Step 4: View Your Website

After a few minutes, your website will be live at:
`https://username.github.io`

Replace `username` with your actual GitHub username.

## Customizing the Website

### Update Lab Information

**Homepage (`index.html`):**
- Edit the hero title and subtitle
- Update the "About Our Lab" section
- Modify research focus areas

**Team Page (`team.html`):**
- Replace placeholder names with actual team members
- Update titles and roles
- Add photos (replace the `.photo-placeholder` divs)

**Research Page (`research.html`):**
- Add your actual research areas and descriptions
- Include publications when available
- Update tools and resources

**Contact Page (`contact.html`):**
- Replace `cordero.lab@university.edu` with your actual email
- Update the location information
- Modify opportunity descriptions

### Adding Photos

To add team member photos:

1. Upload image files to your GitHub repository
2. In `team.html`, replace this:
   ```html
   <div class="photo-placeholder">AC</div>
   ```
   
   With this:
   ```html
   <img src="your-photo.jpg" alt="Name">
   ```

### Changing Colors

All colors are defined in `styles.css` at the top in the `:root` section:

```css
:root {
    --primary: #2c5f7c;      /* Main brand color */
    --accent: #d97440;        /* Accent color */
    /* Change these hex codes to your preferred colors */
}
```

## Updating Your Website

After the initial setup, to make changes:

1. Edit the files on your computer
2. Go to your repository on GitHub
3. Click **Add file** → **Upload files**
4. Upload the updated files (they'll replace the old ones)
5. Commit the changes
6. Your website will update automatically in a few minutes

## Need Help?

If you run into issues:
- Make sure your repository name is exactly `username.github.io`
- Check that GitHub Pages is enabled in Settings → Pages
- Wait 5-10 minutes after uploading - it takes time for changes to appear
- Make sure all files are in the root directory (not in a subfolder)

## What's Next?

Once your website is live, you can:
- Add a custom domain (yourlab.com instead of username.github.io)
- Add Google Analytics to track visitors
- Include a blog section for lab news
- Add interactive data visualizations
- Include more detailed project pages

Good luck with your website!
