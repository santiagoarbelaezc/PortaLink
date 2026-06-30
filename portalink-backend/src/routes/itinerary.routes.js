const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/itinerary.controller');

// All routes require a valid JWT
router.use(authMiddleware);

// ── Task CRUD ──────────────────────────────────────────────
router.get('/',              ctrl.getTasks);         // GET  /api/itinerary?type=work&completed=false&week_start=...
router.get('/week',          ctrl.getWeek);          // GET  /api/itinerary/week?week_start=YYYY-MM-DD
router.get('/today',         ctrl.getToday);         // GET  /api/itinerary/today
router.post('/',             ctrl.createTask);        // POST /api/itinerary
router.put('/:id',           ctrl.updateTask);        // PUT  /api/itinerary/:id
router.patch('/:id/toggle',  ctrl.toggleTask);        // PATCH /api/itinerary/:id/toggle
router.delete('/:id',        ctrl.deleteTask);        // DELETE /api/itinerary/:id

// ── Notifications ──────────────────────────────────────────
router.get('/notifications',                    ctrl.getNotifications);       // GET  /api/itinerary/notifications
router.post('/notifications/:taskId/seen',      ctrl.markNotificationSeen);   // POST /api/itinerary/notifications/:taskId/seen

module.exports = router;
