const express = require('express');
const { getAllActivities } = require('../db');
const router = express.Router();


// GET /api/activities/:activityId/routines

// GET /api/activities
router.get('/', async (req, res, next) => {
    try {
        const allActivities = await getAllActivities();

        res.send(allActivities);

    } catch (error) {
     next(error);
    }
 });

// POST /api/activities

// PATCH /api/activities/:activityId

module.exports = router;
