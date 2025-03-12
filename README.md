# 100-Day Study Streak Tracker

A static website that helps you track your 100-day study streak challenge. The application allows you to track your daily study habits, log your progress, and maintain a streak counter for consistent studying.

![Screenshot of the 100-Day Study Streak Tracker](assets/images/screenshot.png)

## Features

- **Daily Streak Tracker**: Displays the number of consecutive study days completed
- **Task List**: Add, manage, and track completion of daily tasks
- **Study Log**: Record study activities and track hours (minimum 6 hours per day recommended)
- **Achievements**: Document your daily accomplishments
- **Twitter-Style Feed**: View your study logs in a Twitter-like interface with profile avatars, engagement actions, and timestamps
- **Quick Share**: Post short study updates without creating a full day entry
- **Statistics Dashboard**: Track total study hours, completed tasks, and view visual study trends
- **Tabbed Interface**: Easily navigate between Today's Plan, Study Feed, and Statistics
- **Local Storage**: All data is saved in your browser's local storage
- **Dark/Light Mode**: Toggle between dark and light themes
- **Export Data**: Export your study logs in JSON, CSV, or Markdown format
- **Admin Panel**: Simple password protection for editing streak data
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A GitHub account (if you want to deploy on GitHub Pages)

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/100-day-streak-tracker.git
cd 100-day-streak-tracker
```

2. Open `index.html` in your browser or use a local development server.

### GitHub Pages Deployment

1. Create a new repository on GitHub
2. Push your code to the repository:
```bash
git remote set-url origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

3. Go to your repository settings, scroll down to "GitHub Pages"
4. Select the branch you want to deploy (usually `main`)
5. Your site will be published at `https://yourusername.github.io/your-repo-name/`

## Usage

### Navigating the App

The application is organized into three main tabs:
1. **Today's Plan**: Where you add tasks and log your daily study progress
2. **Study Feed**: A Twitter-like feed showing all your entries and quick updates
3. **Statistics**: Visual dashboard of your study habits over time

### Adding Tasks

1. Go to the **Today's Plan** tab
2. Type your task in the "Add a new task..." input field
3. Press Enter or click the "Add" button to add the task
4. Check off tasks as you complete them

### Logging Your Day

1. Enter what you studied in the "Study Log" textarea
2. Input how many hours you studied (warning will appear if less than 6 hours)
3. Document your achievements for the day (optional)
4. Click "Complete Today's Entry" to save your progress

### Quick Share Updates

1. Go to the **Study Feed** tab
2. Type a short update in the "Share your study progress..." field
3. Click "Share" to post it immediately without affecting your streak

### Viewing Statistics

The **Statistics** tab provides:
- Total number of study days
- Total hours studied
- Number of tasks completed
- Average hours studied per day
- Visual chart of your recent study hours

### Viewing Your Progress

Your study logs will appear in the "Study Feed" tab, displaying:
- The date and time of each entry
- Which day of the streak it was
- How many hours you studied
- What you studied
- Your achievements
- Tasks completed that day
- Interactive actions (like, comment, share)

### Admin Access

To edit streak data:
1. Click "Admin" or "Settings" in the footer
2. Enter the default password: `admin123`
3. Adjust your streak count manually
4. Save your settings

### Data Export

1. Go to Settings
2. Select your preferred format (JSON, CSV, Markdown)
3. Click "Export Data" to download

## Customization

### Changing the Admin Password

For security reasons, you should change the default admin password. Open `js/app.js` and modify the `adminPassword` value:

```javascript
const appState = {
    // ...
    adminPassword: 'your-new-password',
    // ...
};
```

### Customizing Colors

The application uses CSS variables for consistent theming. You can modify the colors by editing the `:root` section in `css/styles.css`.

## Data Storage

All data is stored in your browser's local storage. This means:

- Your data persists between browser sessions
- Clearing your browser data will erase your streak information
- You can export your data and import it on another device (using the admin panel)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Font Awesome for icons
- Google Fonts for the Inter font family
- GitHub Pages for hosting 