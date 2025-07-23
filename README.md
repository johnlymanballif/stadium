# Cold Email Tracker

A beautiful, motivating web app to track daily cold email outreach goals.

## Features

- 📧 Track unlimited daily emails with company/contact names
- ✏️ Edit and delete email entries
- 🔥 Streak counter to maintain momentum
- 📊 Visual progress tracking with color-changing progress bars
- 📅 Calendar heatmap with dates showing consistency
- 🌙 Light/Dark mode toggle
- 💾 Local storage persistence
- 📱 Mobile-responsive design

## Usage

1. Open `index.html` in your browser
2. Add each cold email you send by typing the company/contact name
3. Press Enter or click + to add
4. Complete at least 3 emails to unlock the "Complete Day" button
5. Track your progress toward your next client (50 emails → 2 meetings → 1 client)

## Features in Detail

### Email Management
- Add emails with company/contact names
- Each email shows timestamp
- Hover to see edit/delete options
- Edit inline by clicking the pencil icon
- Delete with confirmation

### Progress Tracking
- Circular progress ring fills as you complete emails
- Turns green when you hit your daily minimum (3)
- Real-time client progress bar with color coding:
  - Red (0-25%): Just starting
  - Orange (25-50%): Building momentum
  - Yellow (50-75%): Getting close
  - Green (75-100%): Almost there!

### Calendar View
- Shows current month with day numbers
- Completed days are highlighted
- Today has a special border
- Hover over completed days to see email count

## Customization

You can modify the conversion metrics in `script.js`:
- Email to meeting rate: 4% (line ~241)
- Emails per client: 50 (throughout the code)
- Minimum daily emails: 3 (line ~196)

## Development

To run locally:
1. Clone this repository
2. Open `index.html` in your browser
3. No build process required!

### File Structure