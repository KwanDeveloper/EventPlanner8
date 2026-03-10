# Event Planners

> Your all-in-one platform for events near you.

Whether you're trying to get more involved this year or just looking to try new things, **Event Planners** is the solution. Our platform connects users with local events tailored to their interests, powered by personalized recommendations and a secure, verified host ecosystem.

---

## Features

- **Personalized Suggestions** — A machine learning algorithm learns what you like to do and suggests events tailored to your interests.
- **Location-Based Events** — Find events closest to you and discover what's coming up in your area.
- **Security in Mind** — Our host verification process ensures every event is legitimate, protecting the community from fraudulent listings and unverified organizers.

---

## Screenshots

<!-- Add screenshots of the app here -->

| Home | Dashboard |
|------|-----------|
| _screenshot_ | _screenshot_ |

---

## Tech Stack

### Frontend
- [React](https://react.dev/) (v19)
- [React Router](https://reactrouter.com/) — client-side routing

### Backend
- [Python](https://www.python.org/) — server-side logic and API
- [MongoDB](https://www.mongodb.com/) — database for users and events

---

## Project Structure

```
cen3031-teamproject/
├── src/
│   ├── frontend/
│   │   └── event_web/       # React application
│   │       ├── public/
│   │       └── src/
│   │           ├── App.js
│   │           ├── DashboardPage.js
│   │           ├── LoginPage.js
│   │           ├── SignupPage.js
│   │           ├── ProfilePage.js
│   │           ├── HostRegistrationPage.js
│   │           ├── AboutPage.js
│   │           └── ForgotPasswordPage.js
│   └── backend/             # Python backend (in progress)
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js & npm
- Python 3.x
- MongoDB

### Run the Frontend

```bash
cd src/frontend/event_web
npm install
npm start
```

The app will be available at `http://localhost:3000`.

### Run the Backend

```bash
cd src/backend
# setup instructions coming soon
```

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing / Home |
| `/login` | User login |
| `/signup` | New user registration |
| `/dashboard` | Main app dashboard |
| `/profile` | User profile |
| `/hostregistration` | Register as an event host |
| `/about` | About the platform |
| `/forgotpassword` | Password reset |

---

## Contributing

This is a university group project for **CEN3031**. Please follow the team's branching and PR conventions when contributing.

---

## License

For academic use only.
