const mongoose = require('mongoose');
const Form = require('./models/Form');
const Response = require('./models/Response');
require('dotenv').config();

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/form-builder?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB Atlas for seeding...');
})
.catch((error) => {
  console.error('MongoDB Atlas connection error:', error);
  console.log('\nPlease check your MONGODB_URI in the .env file');
  console.log('Format: mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority');
  process.exit(1);
});

// Demo forms data
const demoForms = [
  {
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services by providing your valuable feedback",
    headerImage: null,
    questions: [
      {
        type: "categorize",
        title: "How would you rate our customer service?",
        image: null,
        required: true,
        order: 1,
        categories: [
          { name: "Excellent", color: "#10B981" },
          { name: "Good", color: "#3B82F6" },
          { name: "Average", color: "#F59E0B" },
          { name: "Poor", color: "#EF4444" }
        ],
        items: [
          { text: "Response time", category: "Good" },
          { text: "Friendliness", category: "Excellent" },
          { text: "Problem resolution", category: "Average" },
          { text: "Knowledge", category: "Good" }
        ]
      },
      {
        type: "cloze",
        title: "Complete the sentence: Our company values ___ and ___.",
        image: null,
        required: true,
        order: 2,
        text: "Our company values innovation and customer satisfaction.",
        blanks: [
          { answer: "innovation", hint: "Creating new ideas" },
          { answer: "customer satisfaction", hint: "Making customers happy" }
        ]
      },
      {
        type: "comprehension",
        title: "Read the passage and answer the questions below",
        image: null,
        required: true,
        order: 3,
        passage: "Our company was founded in 2010 with a mission to provide innovative solutions to everyday problems. We believe in sustainable growth and building long-term relationships with our customers. Our team consists of passionate professionals who are committed to excellence in everything we do.",
        questions: [
          {
            question: "When was the company founded?",
            type: "multiple-choice",
            options: ["2008", "2010", "2012", "2015"],
            correctAnswer: "2010",
            points: 1
          },
          {
            question: "What is the company's approach to growth?",
            type: "short-answer",
            correctAnswer: "sustainable",
            points: 1
          },
          {
            question: "The company focuses on building long-term relationships with customers.",
            type: "true-false",
            correctAnswer: "true",
            points: 1
          }
        ]
      }
    ],
    isPublished: true,
    allowMultipleResponses: false,
    theme: {
      primaryColor: "#3B82F6",
      backgroundColor: "#FFFFFF"
    },
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true
    },
    createdBy: "Marketing Team"
  },
  {
    title: "Employee Onboarding Quiz",
    description: "Test your knowledge about company policies and procedures",
    headerImage: null,
    questions: [
      {
        type: "categorize",
        title: "Categorize these company policies",
        image: null,
        required: true,
        order: 1,
        categories: [
          { name: "HR Policies", color: "#8B5CF6" },
          { name: "IT Policies", color: "#06B6D4" },
          { name: "Safety Policies", color: "#F59E0B" }
        ],
        items: [
          { text: "Dress code", category: "HR Policies" },
          { text: "Password requirements", category: "IT Policies" },
          { text: "Fire evacuation", category: "Safety Policies" },
          { text: "Leave policy", category: "HR Policies" },
          { text: "Software installation", category: "IT Policies" }
        ]
      },
      {
        type: "cloze",
        title: "Fill in the blanks about workplace safety",
        image: null,
        required: true,
        order: 2,
        text: "In case of emergency, call 911 and notify your supervisor immediately.",
        blanks: [
          { answer: "911", hint: "Emergency number" },
          { answer: "supervisor", hint: "Your manager" }
        ]
      },
      {
        type: "comprehension",
        title: "Read the employee handbook excerpt and answer questions",
        image: null,
        required: true,
        order: 3,
        passage: "Employees are expected to arrive at work on time and maintain professional conduct throughout the workday. Breaks are scheduled and should not exceed the allocated time. All employees must complete their assigned tasks within deadlines and report any issues to their immediate supervisor.",
        questions: [
          {
            question: "What should employees do if they encounter issues?",
            type: "multiple-choice",
            options: ["Ignore them", "Report to supervisor", "Tell coworkers", "Wait for resolution"],
            correctAnswer: "Report to supervisor",
            points: 1
          },
          {
            question: "Employees should maintain professional conduct during work hours.",
            type: "true-false",
            correctAnswer: "true",
            points: 1
          }
        ]
      }
    ],
    isPublished: true,
    allowMultipleResponses: false,
    theme: {
      primaryColor: "#8B5CF6",
      backgroundColor: "#F8FAFC"
    },
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true
    },
    createdBy: "HR Department"
  },
  {
    title: "Product Knowledge Assessment",
    description: "Test your understanding of our product features and benefits",
    headerImage: null,
    questions: [
      {
        type: "categorize",
        title: "Categorize these product features",
        image: null,
        required: true,
        order: 1,
        categories: [
          { name: "Core Features", color: "#059669" },
          { name: "Advanced Features", color: "#DC2626" },
          { name: "Future Features", color: "#7C3AED" }
        ],
        items: [
          { text: "User authentication", category: "Core Features" },
          { text: "AI-powered analytics", category: "Advanced Features" },
          { text: "Mobile app", category: "Core Features" },
          { text: "Blockchain integration", category: "Future Features" },
          { text: "Real-time notifications", category: "Advanced Features" }
        ]
      },
      {
        type: "cloze",
        title: "Complete the product description",
        image: null,
        required: true,
        order: 2,
        text: "Our platform offers seamless integration with popular tools and provides comprehensive analytics for data-driven decisions.",
        blanks: [
          { answer: "integration", hint: "Connecting with other tools" },
          { answer: "analytics", hint: "Data analysis and insights" }
        ]
      },
      {
        type: "comprehension",
        title: "Read about our product architecture and answer questions",
        image: null,
        required: true,
        order: 3,
        passage: "Our product is built on a microservices architecture that ensures scalability and reliability. We use cloud-native technologies and follow industry best practices for security. The platform supports multiple deployment options including on-premise, cloud, and hybrid models.",
        questions: [
          {
            question: "What architecture does our product use?",
            type: "multiple-choice",
            options: ["Monolithic", "Microservices", "Serverless", "Event-driven"],
            correctAnswer: "Microservices",
            points: 1
          },
          {
            question: "Name one deployment option our platform supports.",
            type: "short-answer",
            correctAnswer: "cloud",
            points: 1
          }
        ]
      }
    ],
    isPublished: true,
    allowMultipleResponses: true,
    theme: {
      primaryColor: "#059669",
      backgroundColor: "#F0FDF4"
    },
    settings: {
      showProgressBar: true,
      showQuestionNumbers: true
    },
    createdBy: "Product Team"
  }
];

// Demo responses data
const createDemoResponses = (forms) => {
  const responses = [];
  
  forms.forEach(form => {
    // Create 3-5 responses for each form
    const numResponses = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numResponses; i++) {
      const answers = form.questions.map(question => {
        let answer, points = 0, isCorrect = false;
        
        switch (question.type) {
          case 'categorize':
            // Randomly categorize items
            const categorizedItems = question.items.map(item => ({
              text: item.text,
              category: question.categories[Math.floor(Math.random() * question.categories.length)].name
            }));
            answer = { items: categorizedItems };
            // Award points for correct categorizations
            points = Math.floor(Math.random() * question.items.length);
            isCorrect = points > question.items.length / 2;
            break;
            
          case 'cloze':
            // Randomly fill some blanks correctly
            const filledBlanks = question.blanks.map(blank => {
              const isCorrect = Math.random() > 0.3;
              return {
                answer: isCorrect ? blank.answer : `answer${Math.floor(Math.random() * 100)}`,
                hint: blank.hint
              };
            });
            answer = { blanks: filledBlanks };
            points = filledBlanks.filter(b => b.answer === question.blanks.find(orig => orig.hint === b.hint)?.answer).length;
            isCorrect = points > question.blanks.length / 2;
            break;
            
          case 'comprehension':
            // Randomly answer comprehension questions
            const comprehensionAnswers = question.questions.map(q => {
              let qAnswer, qPoints = 0, qIsCorrect = false;
              
              if (q.type === 'multiple-choice') {
                qAnswer = q.options[Math.floor(Math.random() * q.options.length)];
                qIsCorrect = qAnswer === q.correctAnswer;
                qPoints = qIsCorrect ? q.points : 0;
              } else if (q.type === 'short-answer') {
                qAnswer = Math.random() > 0.4 ? q.correctAnswer : `answer${Math.floor(Math.random() * 100)}`;
                qIsCorrect = qAnswer === q.correctAnswer;
                qPoints = qIsCorrect ? q.points : 0;
              } else if (q.type === 'true-false') {
                qAnswer = Math.random() > 0.3 ? q.correctAnswer : (q.correctAnswer === 'true' ? 'false' : 'true');
                qIsCorrect = qAnswer === q.correctAnswer;
                qPoints = qIsCorrect ? q.points : 0;
              }
              
              return {
                question: q.question,
                answer: qAnswer,
                points: qPoints,
                isCorrect: qIsCorrect
              };
            });
            answer = { questions: comprehensionAnswers };
            points = comprehensionAnswers.reduce((sum, q) => sum + q.points, 0);
            isCorrect = points > question.questions.reduce((sum, q) => sum + q.points, 0) / 2;
            break;
        }
        
        return {
          questionId: question._id || new mongoose.Types.ObjectId(),
          questionType: question.type,
          answer: answer,
          points: points,
          isCorrect: isCorrect
        };
      });
      
      const totalScore = answers.reduce((sum, a) => sum + a.points, 0);
      const maxScore = form.questions.reduce((sum, q) => {
        if (q.type === 'categorize') return sum + q.items.length;
        if (q.type === 'cloze') return sum + q.blanks.length;
        if (q.type === 'comprehension') return sum + q.questions.reduce((qSum, subQ) => qSum + subQ.points, 0);
        return sum;
      }, 0);
      
      responses.push({
        formId: form._id || new mongoose.Types.ObjectId(),
        respondent: {
          name: `Demo User ${i + 1}`,
          email: `demo${i + 1}@example.com`,
          anonymous: false
        },
        answers: answers,
        totalScore: totalScore,
        maxScore: maxScore,
        timeSpent: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
        startedAt: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24 hours
        submittedAt: new Date(),
        ipAddress: `192.168.1.${100 + i}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }
  });
  
  return responses;
};

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Form.deleteMany({});
    await Response.deleteMany({});
    
    // Insert demo forms
    console.log('Inserting demo forms...');
    const insertedForms = await Form.insertMany(demoForms);
    console.log(`Inserted ${insertedForms.length} forms`);
    
    // Create and insert demo responses
    console.log('Creating demo responses...');
    const demoResponses = createDemoResponses(insertedForms);
    const insertedResponses = await Response.insertMany(demoResponses);
    console.log(`Inserted ${insertedResponses.length} responses`);
    
    console.log('Database seeding completed successfully!');
    console.log('\nDemo forms created:');
    insertedForms.forEach(form => {
      console.log(`- ${form.title} (${form.questions.length} questions)`);
    });
    
    console.log('\nDemo responses created:');
    console.log(`- Total responses: ${insertedResponses.length}`);
    console.log(`- Average score: ${(insertedResponses.reduce((sum, r) => sum + r.totalScore, 0) / insertedResponses.length).toFixed(1)}`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the seed function
seedDatabase();
