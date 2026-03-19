var express = require('express');
var router = express.Router();
const Travel = require('../models/travel'); 
const multer = require('multer');
const path = require('path');

// Multer storage setup
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

/* GET index - The Form Page */
router.get('/', function(req, res) {
  res.render('index', { title: 'Add Destination' });
});

/* GET add-travel - The Table Page (Read) */
router.get('/add-travel', async function(req, res) {
  try {
    const travels = await Travel.find();
    res.render('add-travel', { title: 'Saved Travels', travels: travels });
  } catch (err) {
    res.status(500).send("Could not fetch data.");
  }
});

/* POST - Create new record */
router.post('/add-travel', upload.single('image'), async function(req, res) {
  try {
    const newTravel = new Travel({
      destination: req.body.destination,
      country: req.body.country,
      highlight: req.body.highlight,
      photoUrl: req.file ? '/uploads/' + req.file.filename : '/images/default.jpg'
    });
    await newTravel.save();
    res.redirect('/add-travel'); 
  } catch (err) {
    res.status(500).send("Error saving data.");
  }
});

/* GET edit page - Show pre-filled form */
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id.trim();

        // Step 1: Check format (Agar kisi ne URL mein '123' ya random text dala)
        if (id.length !== 24) {
            return res.status(400).send("<h1>Invalid ID Format</h1><p>The ID in the URL is not a valid MongoDB ID.</p><a href='/add-travel'>Go Back</a>");
        }

        const item = await Travel.findById(id);

        // Step 2: Check existence (ID ka format sahi hai par database mein nahi hai)
        if (!item) {
            return res.status(404).send("<h1>ID Not Found</h1><p>Sorry, this destination record does not exist.</p><a href='/add-travel'>Go Back</a>");
        }

        // Sab sahi hai toh page dikhao
        res.render('edit', { title: 'Edit Adventure', item: item });

    } catch (err) {
        res.status(500).send("Internal Server Error.");
    }
});

/* POST edit page - Show pre-filled form */
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id.trim();
        
        // Form se aaya naya data
        const updateData = {
            destination: req.body.destination,
            country: req.body.country,
            highlight: req.body.highlight
        };

        // Check: Kya user ne nayi image select ki hai?
        if (req.file) {
            updateData.photoUrl = '/uploads/' + req.file.filename;
        }

        // Database update command
        const updatedRecord = await Travel.findByIdAndUpdate(id, updateData);

        if (!updatedRecord) {
            return res.status(404).send("Cannot update. Record not found.");
        }

        res.redirect('/add-travel');

    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating the record.");
    }
});

/* POST delete - Remove record (Delete) */
router.post('/delete/:id', async function(req, res) {
  try {
    await Travel.findByIdAndDelete(req.params.id);
    res.redirect('/add-travel');
  } catch (err) {
    res.status(500).send("Error deleting record.");
  }
});

// About page Route
router.get('/about', function(req, res) {
  res.render('about', { title: 'About Our Directory' });
});

module.exports = router;