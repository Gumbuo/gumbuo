# Gumbuo Fighters (FoxHole) - Setup Instructions

This directory is where your exported GDevelop fighting game should be placed.

## Export Instructions

Follow these steps to export your game from GDevelop and integrate it into the Gumbuo site:

### Step 1: Open GDevelop Project
1. Launch GDevelop 5
2. Open the game project file: `IDEAS ONLY/game.json`

### Step 2: Export to HTML5
1. In GDevelop, click **File → Export**
2. Select **Web (HTML5)** as the export type
3. Choose a temporary export location (like your Desktop or Downloads folder)
4. Click **Export** and wait for the process to complete

### Step 3: Copy Exported Files
1. Once export is complete, navigate to your export folder
2. You should see files like:
   - `index.html`
   - `code0.js`
   - `code1.js` (and possibly more code files)
   - Asset folders (images, audio, etc.)
3. **Copy ALL of these files** to this directory: `public/games/gumbuo-fighters/`

### Step 4: Test the Game
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3000/base`
3. Click the **"Gumbuo Fighters"** button in the game selector
4. Your fighting game should load!

## Important Notes

- Make sure to copy **ALL exported files**, not just index.html
- The game will automatically detect if files are missing and show setup instructions
- If the game doesn't load, check the browser console for errors
- The game runs in an iframe for better isolation and compatibility

## Troubleshooting

**Game doesn't load?**
- Verify all files are in `public/games/gumbuo-fighters/`
- Check that index.html exists in the root of this folder
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

**Black screen?**
- Check browser console for JavaScript errors
- Ensure GDevelop export completed successfully
- Try exporting again from GDevelop

**Game is too small/large?**
- The game will automatically fill the available space
- You can adjust canvas settings in GDevelop before exporting

## Game Features

Your FoxHole (Gumbuo Fighters) game includes:
- 2D pixel art fighting mechanics
- Character animations (idle, move, jump, punch, kick, hurt, death)
- Sound effects and music
- Health bars and player profiles
- Pause menu and game controls
- Enemy AI
- Collectibles (apples, barrels, etc.)

Enjoy your game!
