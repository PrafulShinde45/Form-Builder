const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['categorize', 'cloze', 'comprehension'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL to uploaded image
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  // Categorize question specific fields
  categories: [{
    name: String,
    color: String
  }],
  items: [{
    text: String,
    category: String
  }],
  // Cloze question specific fields
  text: String, // Text with blanks
  blanks: [{
    text: String,
    answer: String,
    hint: String
  }],
  // Options available to drag into blanks
  answerOptions: [String],
  // Comprehension question specific fields
  passage: String,
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'true-false'],
      default: 'multiple-choice'
    },
    options: [String], // For multiple choice
    correctAnswer: String,
    points: {
      type: Number,
      default: 1
    }
  }]
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  headerImage: {
    type: String, // URL to uploaded header image
    default: null
  },
  questions: [questionSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  allowMultipleResponses: {
    type: Boolean,
    default: false
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    backgroundColor: {
      type: String,
      default: '#FFFFFF'
    }
  },
  settings: {
    showProgressBar: {
      type: Boolean,
      default: true
    },
    showQuestionNumbers: {
      type: Boolean,
      default: true
    }
  },
  createdBy: {
    type: String,
    default: 'Anonymous'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema);
