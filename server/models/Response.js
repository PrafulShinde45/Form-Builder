const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionType: {
    type: String,
    enum: ['categorize', 'cloze', 'comprehension'],
    required: true
  },
  answer: mongoose.Schema.Types.Mixed, // Flexible answer structure
  points: {
    type: Number,
    default: 0
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  respondent: {
    name: String,
    email: String,
    anonymous: {
      type: Boolean,
      default: true
    }
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String
});

// Calculate total score before saving
responseSchema.pre('save', function(next) {
  this.totalScore = this.answers.reduce((sum, answer) => sum + answer.points, 0);
  next();
});

module.exports = mongoose.model('Response', responseSchema);
