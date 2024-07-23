const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Endpoint to save itinerary
router.post('/', async (req, res) => {
    const { destination, days, activities } = req.body;

    const itinerary = new Itinerary({ destination, days, activities });

    try {
        const savedItinerary = await itinerary.save();
        res.json(savedItinerary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to get itinerary by destination
router.get('/:destination', async (req, res) => {
    const { days } = req.query;

    try {
        const itinerary = await Itinerary.findOne({ destination: req.params.destination });
        if (itinerary) {
            const filteredActivities = itinerary.activities.filter(activity => activity.day <= days);
            res.json({ destination: itinerary.destination, days, activities: filteredActivities });
        } else {
            res.status(404).json({ message: 'Itinerary not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to handle contact form and send email
router.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send email to yourself or another recipient
        subject: `Contact form submission from ${name}`,
        text: `You have received a new message from ${name} (${email}):\n\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ status: 'success', message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ status: 'fail', error: 'Failed to send email. Please try again later.' });
    }
});

// Endpoint to get destination suggestions
router.get('/suggestions/:query', async (req, res) => {
    const query = req.params.query;
    try {
        const suggestions = await Itinerary.find({
            destination: { $regex: `^${query}`, $options: 'i' }
        }).limit(10).select('destination -_id');
        res.json(suggestions.map(suggestion => suggestion.destination));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
