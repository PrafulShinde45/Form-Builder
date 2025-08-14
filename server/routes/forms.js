const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Form = require('../models/Form');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all forms
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific form
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new form
router.post('/', async (req, res) => {
  try {
    const form = new Form(req.body);
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a form
router.put('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a form
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload header image
router.post('/:id/header-image', upload.single('headerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { headerImage: imageUrl },
      { new: true }
    );

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json({ headerImage: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload question image
router.post('/:id/questions/:questionIndex/image', upload.single('questionImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const form = await Form.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const questionIndex = parseInt(req.params.questionIndex);
    if (questionIndex >= 0 && questionIndex < form.questions.length) {
      form.questions[questionIndex].image = imageUrl;
      await form.save();
      res.json({ image: imageUrl });
    } else {
      res.status(400).json({ message: 'Invalid question index' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Publish/Unpublish a form
router.patch('/:id/publish', async (req, res) => {
  try {
    const { isPublished } = req.body;
    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { new: true }
    );
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
