const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Helper: calculate expiration date from today (or from base date) + N months
function addMonths(baseDate, months) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

// POST /api/members - Create a new member
router.post('/', async (req, res) => {
  try {
    const { fullName, phoneNumber, durationMonths } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: 'fullName and phoneNumber are required' });
    }

    // durationMonths defaults to 1 if not provided or invalid
    const months = Math.max(1, parseInt(durationMonths) || 1);

    const joinDate = new Date();
    const expirationDate = addMonths(joinDate, months);

    const member = await prisma.member.create({
      data: {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        joinDate,
        expirationDate,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A member with this phone number already exists' });
    }
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// GET /api/members - List all members, optional search by name or phone
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    const where = q
      ? {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { phoneNumber: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const members = await prisma.member.findMany({
      where,
      orderBy: { fullName: 'asc' },
    });

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Get a single member
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid member ID' });

    const member = await prisma.member.findUnique({ where: { id } });

    if (!member) return res.status(404).json({ error: 'Member not found' });

    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// PATCH /api/members/:id/renew - Renew membership by N months (default 1)
router.patch('/:id/renew', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid member ID' });

    const months = Math.max(1, parseInt(req.body.durationMonths) || 1);

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Member not found' });

    // If already expired, extend from today; otherwise extend from current expiration
    const baseDate =
      new Date(existing.expirationDate) < new Date()
        ? new Date()
        : new Date(existing.expirationDate);

    const newExpiration = addMonths(baseDate, months);

    const member = await prisma.member.update({
      where: { id },
      data: { expirationDate: newExpiration },
    });

    res.json(member);
  } catch (error) {
    console.error('Renew member error:', error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

// DELETE /api/members/:id - Delete a member
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid member ID' });

    await prisma.member.delete({ where: { id } });
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Member not found' });
    }
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

module.exports = router;
