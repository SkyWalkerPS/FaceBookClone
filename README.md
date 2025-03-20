# Facebook Clone

A full-stack social media application built with the MERN stack (MongoDB, Express.js, React, Node.js) that implements core Facebook features.

## 🚀 Features

- **Authentication**
  - User signup and login with JWT
  - Secure password hashing
  - Protected routes

- **User Profile**
  - Custom profile pictures (Cloudinary integration)
  - Bio and personal information
  - Friend list management

- **Social Features**
  - Add/Remove friends
  - Real-time chat using Socket.IO
  - News feed with posts and updates
  - Like and comment on posts
  - Share posts

- **Posts**
  - Create text and image posts
  - Like, comment, and share functionality
  - Save posts for later

## 🛠️ Tech Stack

- **Frontend**
  - React.js
  - Redux for state management
  - Socket.IO client for real-time features
  - Modern UI with responsive design

- **Backend**
  - Node.js & Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - Socket.IO for real-time communication
  - Cloudinary for image storage

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account
- Cloudinary account for image storage

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/facebook-clone.git
cd facebook-clone
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following:
```env
PORT=3000
URL=http://localhost:6423
MONGO_URL=mongodb://localhost:27017/facebookclone
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

4. Start the development servers

For backend:
```bash
# From the root directory
npm run dev
```

For frontend:
```bash
# From the frontend directory
npm run dev
```

The application will be available at:
- Frontend: http://localhost:6423
- Backend: http://localhost:3000

## 📱 Usage

1. **Register/Login**
   - Create a new account or login with existing credentials
   - Profile setup with picture and bio

2. **Social Interactions**
   - Add friends from suggested users
   - Accept/reject friend requests
   - Chat with friends in real-time

3. **Content Sharing**
   - Create posts with text and images
   - Interact with posts (like, comment, share)
   - Save interesting posts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time functionality
- Cloudinary for image management
- MongoDB Atlas for database hosting
- React community for amazing tools and libraries