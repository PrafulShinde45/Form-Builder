# Custom Form Builder

A modern, responsive form builder built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS.

## Features

- **Form Editor**: Create and edit forms with a drag-and-drop interface
- **Question Types**: Support for Categorize, Cloze, and Comprehension questions
- **Image Support**: Add images to questions and header images
- **Form Preview**: Preview forms before publishing
- **Response Collection**: Collect and store form responses in MongoDB
- **Responsive Design**: Modern UI that works on all devices

## Question Types

1. **Categorize**: Group items into categories
2. **Cloze**: Fill-in-the-blank questions
3. **Comprehension**: Reading comprehension with multiple questions

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **File Upload**: Multer for image handling
- **Authentication**: JWT tokens

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd custom-form-builder
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   └── utils/        # Utility functions
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── uploads/          # Image uploads
└── package.json
```

## API Endpoints

- `POST /api/forms` - Create a new form
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get a specific form
- `PUT /api/forms/:id` - Update a form
- `DELETE /api/forms/:id` - Delete a form
- `POST /api/forms/:id/responses` - Submit form responses
- `GET /api/forms/:id/responses` - Get form responses

## Deployment

The project can be deployed to:
- **Frontend**: Vercel, Netlify, or any static hosting service
- **Backend**: Render, Heroku, or any Node.js hosting service
- **Database**: MongoDB Atlas

## License

MIT License
