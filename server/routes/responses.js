const express = require('express');
const Response = require('../models/Response');
const Form = require('../models/Form');

const router = express.Router();

// Submit a form response
router.post('/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    if (!form.isPublished) {
      return res.status(400).json({ message: 'Form is not published' });
    }

    const responseData = {
      formId,
      respondent: req.body.respondent || {},
      answers: [],
      maxScore: 0,
      timeSpent: req.body.timeSpent || 0,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Process answers and calculate scores
    for (let i = 0; i < req.body.answers.length; i++) {
      const answer = req.body.answers[i];
      const question = form.questions[i];
      
      if (!question) continue;

      let processedAnswer = {
        questionId: question._id,
        questionType: question.type,
        answer: answer.answer,
        points: 0,
        isCorrect: false
      };

      // Calculate points based on question type
      switch (question.type) {
        case 'categorize':
          processedAnswer.points = calculateCategorizeScore(question, answer.answer);
          break;
        case 'cloze':
          processedAnswer.points = calculateClozeScore(question, answer.answer);
          break;
        case 'comprehension':
          processedAnswer.points = calculateComprehensionScore(question, answer.answer);
          break;
      }

      responseData.answers.push(processedAnswer);
      responseData.maxScore += question.questions ? 
        question.questions.reduce((sum, q) => sum + q.points, 0) : 1;
    }

    const response = new Response(responseData);
    const savedResponse = await response.save();
    
    res.status(201).json(savedResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all responses for a form
router.get('/:formId', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a response by id
router.delete('/:responseId', async (req, res) => {
  try {
    const deleted = await Response.findByIdAndDelete(req.params.responseId);
    if (!deleted) {
      return res.status(404).json({ message: 'Response not found' });
    }
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get response statistics for a form
router.get('/:formId/stats', async (req, res) => {
  try {
    const responses = await Response.find({ formId: req.params.formId });
    
    if (responses.length === 0) {
      return res.json({
        totalResponses: 0,
        averageScore: 0,
        completionRate: 0,
        questionStats: []
      });
    }

    const totalResponses = responses.length;
    const averageScore = responses.reduce((sum, r) => sum + r.totalScore, 0) / totalResponses;
    
    // Calculate completion rate (responses with all questions answered)
    const completedResponses = responses.filter(r => 
      r.answers.length === responses[0].answers.length
    ).length;
    const completionRate = (completedResponses / totalResponses) * 100;

    // Get question-level statistics
    const questionStats = [];
    if (responses.length > 0) {
      const numQuestions = responses[0].answers.length;
      
      for (let i = 0; i < numQuestions; i++) {
        const questionResponses = responses.map(r => r.answers[i]).filter(Boolean);
        const avgQuestionScore = questionResponses.reduce((sum, a) => sum + a.points, 0) / questionResponses.length;
        
        questionStats.push({
          questionIndex: i,
          averageScore: avgQuestionScore,
          responseCount: questionResponses.length
        });
      }
    }

    res.json({
      totalResponses,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      questionStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions for scoring
function calculateCategorizeScore(question, answer) {
  if (!question.items || !answer.categories) return 0;
  
  let correct = 0;
  const total = question.items.length;
  
  question.items.forEach(item => {
    const userCategory = answer.categories.find(c => c.itemId === item._id || c.text === item.text);
    if (userCategory && userCategory.category === item.category) {
      correct++;
    }
  });
  
  return (correct / total) * 100;
}

function calculateClozeScore(question, answer) {
  if (!question.blanks || !answer.blanks) return 0;
  
  let correct = 0;
  const total = question.blanks.length;
  
  question.blanks.forEach((blank, index) => {
    const userAnswer = answer.blanks[index];
    if (userAnswer && userAnswer.answer && 
        userAnswer.answer.toLowerCase().trim() === blank.answer.toLowerCase().trim()) {
      correct++;
    }
  });
  
  return (correct / total) * 100;
}

function calculateComprehensionScore(question, answer) {
  if (!question.questions || !answer.questions) return 0;
  
  let totalPoints = 0;
  let earnedPoints = 0;
  
  question.questions.forEach((q, index) => {
    const userAnswer = answer.questions[index];
    if (!userAnswer) return;
    
    totalPoints += q.points;
    
    switch (q.type) {
      case 'multiple-choice':
        if (userAnswer.answer === q.correctAnswer) {
          earnedPoints += q.points;
        }
        break;
      case 'true-false':
        if (userAnswer.answer === q.correctAnswer) {
          earnedPoints += q.points;
        }
        break;
      case 'short-answer':
        // For short answer, give partial credit for close matches
        if (userAnswer.answer && 
            userAnswer.answer.toLowerCase().includes(q.correctAnswer.toLowerCase())) {
          earnedPoints += q.points * 0.5;
        }
        break;
    }
  });
  
  return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
}

module.exports = router;
