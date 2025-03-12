# 100-Day Study Streak Tracker

A web application to track your study streak for 100 days. This application helps you maintain a consistent study habit by tracking your daily study sessions, managing your tasks, and visualizing your progress.

## Features

- **Daily Streak Tracking**: Track your consecutive study days and maintain your streak.
- **Task Management**: Create, edit, and complete tasks for your study sessions.
- **Study Logging**: Log your daily study sessions with notes and hours studied.
- **Progress Visualization**: View detailed statistics and progress towards your 100-day goal.
  - Streak progress bar
  - Challenge progress dashboard with milestone markers
  - Weekly completion rate
  - Activity heatmap for the past 3 months
- **Achievements**: Celebrate milestone achievements with special effects.

### Multi-User Support and Security

- **User Authentication**: Secure login and registration system
- **Data Isolation**: Each user has their own isolated data storage
- **Password Security**: Password hashing and strength requirements
- **User Settings**:
  - Password change functionality
  - Data export options
  - User profile management

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub Pages deployment

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/study-tracker.git
   ```

2. Open the `index.html` file in your web browser.

### GitHub Pages Deployment

The application is deployed at: https://avisiingh.github.io/study-tracker/

To deploy your own version:

1. Fork the repository.
2. Go to the repository settings.
3. Navigate to the "Pages" section.
4. Select the branch you want to deploy (e.g., `gh-pages` or `main`).
5. Click "Save".

## Usage

### User Authentication

1. **First-time users**:
   - You'll be redirected to the login page
   - Click "Register" to create a new account
   - Provide a username, email, and secure password (min 6 chars, 1 uppercase, 1 number)
   - You'll be automatically logged in after registration

2. **Returning users**:
   - Enter your email and password on the login page
   - Your study data will be loaded automatically

3. **User Settings**:
   - Access user settings from the settings panel
   - Change your password
   - Export your study data as JSON

### Tracking Your Studies

1. **Add a task**:
   - Click on the "+" button in the Task List section.
   - Enter a task description.
   - Click "Add Task" or press Enter.

2. **Log a study day**:
   - Use the Quick Share feature at the top of the page.
   - Enter what you studied and for how many hours.
   - Click "Share" or press Enter.
   - Your streak will update automatically.

3. **View your statistics**:
   - See your current streak in the Streak Card.
   - View detailed statistics in the Statistics section.
   - Check the Weekly Completion and Activity Heatmap for patterns.

4. **Plan your day**:
   - Use the Day Plan feature to outline your study goals.
   - Track completed tasks to stay organized.

### Interface Navigation

- **Feed Tab**: View your study log history and progress.
- **Tasks Tab**: Manage your study tasks and track completion.
- **Statistics Tab**: View detailed stats about your study habits.
- **Settings Tab**: Customize the application and manage your user account.

## Customization

### Personalization

- You can update your user settings in the Settings tab.
- Change your password or export your data for backup.

### Data Storage

- Your data is stored locally on your device using localStorage.
- Each user's data is stored separately using unique user IDs.
- You can export your data from the user settings panel.

### Security Considerations

- Passwords are hashed before storage for enhanced security.
- Password requirements enforce good security practices.
- The application includes data isolation between users.
- **Note**: While improvements have been made, this is a client-side application with inherent security limitations:
  - Data is stored in localStorage which is specific to the browser/device
  - For production use, consider implementing a backend server with proper database

## Multi-User Support

The application now supports multiple users with security enhancements:

- **User Registration**: Create new user accounts with unique credentials
- **Data Isolation**: Each user has their own isolated data set
- **Profile Management**: View and manage your user profile
- **Password Security**: Improved password security with hashing and strength requirements
- **Export Functionality**: Export your study data for backup or transfer

### Data Portability

You can export your study data as a JSON file, which allows you to:
- Back up your study progress
- Transfer your data to another device
- Share your study log (manually) with others

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was created to help students and lifelong learners maintain consistent study habits.
- Special thanks to all contributors who have helped improve this application. 