import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken, createAccessToken, requireRole } from '../middleware/auth';
import { store } from '../store';
import { Role } from '../types/domain';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'email et mot de passe obligatoires' });
  }

  const user = await store.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = createAccessToken({ userId: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

router.get('/me', authenticateToken, async (req, res) => {
  const auth = req.authUser;
  if (!auth) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  const user = await store.findUserById(auth.userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
});

router.post('/register', authenticateToken, requireRole('admin'), async (req, res) => {
  const { email, name, password, role } = req.body as {
    email?: string;
    name?: string;
    password?: string;
    role?: Role;
  };

  if (!email || !name || !password || !role) {
    return res.status(400).json({ message: 'email, name, password, role sont obligatoires' });
  }

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'role invalide' });
  }

  if (await store.findUserByEmail(email)) {
    return res.status(409).json({ message: 'Email déjà utilisé' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await store.createUser({ email, name, passwordHash, role });

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  });
});

export default router;
