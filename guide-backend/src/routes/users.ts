import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { store } from '../store';

const router = Router();

router.use(authenticateToken, requireRole('admin'));

router.get('/', async (_req, res) => {
  const users = await store.listPublicUsers();
  return res.json(users);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (req.authUser?.userId === id) {
    return res.status(400).json({ message: 'Suppression de votre propre compte interdite' });
  }

  const deleted = await store.deleteUser(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  return res.status(204).send();
});

export default router;
