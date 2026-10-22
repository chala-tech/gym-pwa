const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Helper: calculate expiration date from today (or from base date) + N months
function addMonths(baseDate, months) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Normalize Ethiopian phone numbers to the local 0XXXXXXXXX format.
 * Handles:
 *   +251912345678  → 0912345678
 *   251912345678   → 0912345678
 *   0912345678     → 0912345678  (unchanged)
 *   0712345678     → 0712345678  (unchanged)
 */
function normalizePhone(raw) {
  const s = String(raw).trim().replace(/\s+/g, '');
  if (s.startsWith('+251')) return '0' + s.slice(4);   // +251 91... → 091...
  if (/^251\d{9}$/.test(s))  return '0' + s.slice(3);  // 251 91...  → 091...
  return s;
}

/**
 * Given a normalized local number (09.../07...), also return the +251 equivalent
 * so we can search both storage formats in one OR clause.
 */
function toInternational(local) {
  // Works for partial queries too: "09" → "+2519", "0906" → "+251906"
  // so a contains-search on "+2519..." hits "+251906197566" while still typing.
  if (local.startsWith('0') && local.length >= 2) return '+251' + local.slice(1);
  return null;
}


// POST /api/members - Create a new member
router.post('/', async (req, res) => {
  try {
    const { fullName, phoneNumber, durationMonths } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({ error: 'fullName and phoneNumber are required' });
    }

    // Always store in local format: 0XXXXXXXXX
    const normalizedPhone = normalizePhone(phoneNumber);

    // durationMonths defaults to 1 if not provided or invalid
    const months = Math.max(1, parseInt(durationMonths) || 1);

    const joinDate = new Date();
    const expirationDate = addMonths(joinDate, months);

    const member = await prisma.member.create({
      data: {
        fullName: fullName.trim(),
        phoneNumber: normalizedPhone,
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

    let where = {};
    if (q) {
      // Normalize the search query so "09..." finds "+251 9..." records and vice versa
      const normQ = normalizePhone(q);
      const intlQ = toInternational(normQ); // e.g. "+2519..." if normQ is "09..."

      const phoneConditions = [
        { phoneNumber: { contains: normQ, mode: 'insensitive' } },
      ];
      // If user typed a local number, also search stored +251 variants
      if (intlQ) {
        phoneConditions.push({ phoneNumber: { contains: intlQ, mode: 'insensitive' } });
      }
      // If user typed the raw query (e.g. "+251..."), also search local variant
      if (normQ !== q) {
        phoneConditions.push({ phoneNumber: { contains: q, mode: 'insensitive' } });
      }

      where = {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          ...phoneConditions,
        ],
      };
    }

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
