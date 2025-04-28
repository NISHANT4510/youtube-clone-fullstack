# YouTube Clone

A full-stack video sharing platform built with React, Node.js, and MongoDB that mimics core functionalities of YouTube.

## Features

- 📺 Video upload and streaming
- 👤 User authentication and authorization
- 📱 Responsive design using Tailwind CSS
- 💬 Comment system
- 📊 Channel management
- 🎯 Video categories and search functionality

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Context API for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## Project Structure

```
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── context/   # React Context
│   │   └── services/  # API integration services
│
├── backend/           # Node.js backend server
│   ├── routes/       # API routes
│   ├── models/       # MongoDB models
│   ├── middleware/   # Custom middleware
│   └── utils/        # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube_clone
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the Backend Server:
```bash
cd backend
npm start
```

2. Start the Frontend Development Server:
```bash
cd frontend
npm start
```

The application should now be running on:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features in Detail

### User Features
- User registration and authentication
- Create and manage channels
- Upload and manage videos
- Comment on videos
- Subscribe to channels

### Video Features
- Video upload with thumbnail generation
- Video streaming
- Video search and filtering
- Category-based browsing
- Like/dislike functionality
- Comment system

### Channel Features
- Channel creation and customization
- Channel analytics
- Subscriber management
- Video management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Inspired by YouTube's functionality and design
- Thanks to all contributors who participate in this project