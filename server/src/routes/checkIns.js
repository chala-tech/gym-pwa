const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// POST /api/checkins - Log a check-in for a member
router.post('/', async (req, res) => {
  try {
    const { memberId } = req.body;

    if (!memberId) {
      return res.status(400).json({ error: 'memberId is required' });
    }

    const id = parseInt(memberId);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid memberId' });

    // Verify member exists
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const checkIn = await prisma.checkIn.create({
      data: {
        memberId: id,
        timestamp: new Date(),
      },
      include: { member: true },
    });

    res.status(201).json(checkIn);
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to log check-in' });
  }
});

// GET /api/checkins?memberId=X - Get check-ins for a member
router.get('/', async (req, res) => {
  try {
    const { memberId, limit = 20 } = req.query;

    const where = memberId ? { memberId: parseInt(memberId) } : {};

    const checkIns = await prisma.checkIn.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit),
      include: { member: { select: { fullName: true, phoneNumber: true } } },
    });

    res.json(checkIns);
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

module.exports = router;
