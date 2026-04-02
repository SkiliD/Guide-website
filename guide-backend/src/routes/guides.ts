import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { store } from '../store';
import { ActivityCategory, Audience, Mobility, Season } from '../types/domain';

const router = Router();

const mobilities: Mobility[] = ['voiture', 'velo', 'a_pied', 'moto'];
const seasons: Season[] = ['ete', 'printemps', 'automne', 'hiver'];
const audiences: Audience[] = ['famille', 'seul', 'groupe', 'entre_amis'];
const categories: ActivityCategory[] = ['musee', 'chateau', 'activite', 'parc', 'grotte'];

router.use(authenticateToken);

router.get('/', async (req, res) => {
  const auth = req.authUser;
  if (!auth) {
    return res.status(401).json({ message: 'Non authentifie' });
  }

  const allGuides = await store.listGuides();
  const accessible = allGuides.filter((guide) => store.canAccessGuide(guide, auth.userId, auth.role));
  const frontGuides = await Promise.all(
    accessible.map((guide) => store.toFrontGuide(guide, auth.userId))
  );

  return res.json(frontGuides);
});

router.get('/:id', async (req, res) => {
  const guideId = String(req.params.id);
  const auth = req.authUser;
  if (!auth) {
    return res.status(401).json({ message: 'Non authentifie' });
  }

  const guide = await store.findGuideById(guideId);
  if (!guide) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }

  if (!store.canAccessGuide(guide, auth.userId, auth.role)) {
    return res.status(403).json({ message: 'Acces interdit a ce guide' });
  }

  return res.json(await store.toFrontGuide(guide, auth.userId));
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { title, description, daysCount, mobility, season, audience } = req.body as {
    title?: string;
    description?: string;
    daysCount?: number;
    mobility?: Mobility;
    season?: Season;
    audience?: Audience;
  };

  if (!title || !description || !daysCount || !mobility || !season || !audience) {
    return res.status(400).json({
      message: 'title, description, daysCount, mobility, season, audience sont obligatoires',
    });
  }

  if (!mobilities.includes(mobility) || !seasons.includes(season) || !audiences.includes(audience)) {
    return res.status(400).json({ message: 'Valeurs mobility/season/audience invalides' });
  }

  const ownerId = req.authUser!.userId;
  const guide = await store.createGuide({ title, description, daysCount, mobility, season, audience }, ownerId);

  return res.status(201).json(await store.toFrontGuide(guide, ownerId));
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const { title, description, daysCount, mobility, season, audience } = req.body as {
    title?: string;
    description?: string;
    daysCount?: number;
    mobility?: Mobility;
    season?: Season;
    audience?: Audience;
  };

  if (mobility && !mobilities.includes(mobility)) {
    return res.status(400).json({ message: 'mobility invalide' });
  }
  if (season && !seasons.includes(season)) {
    return res.status(400).json({ message: 'season invalide' });
  }
  if (audience && !audiences.includes(audience)) {
    return res.status(400).json({ message: 'audience invalide' });
  }

  const guide = await store.updateGuide(guideId, { title, description, daysCount, mobility, season, audience });

  if (!guide) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }

  return res.json(await store.toFrontGuide(guide, req.authUser!.userId));
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const deleted = await store.deleteGuide(guideId);
  if (!deleted) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }
  return res.status(204).send();
});

router.post('/:id/members', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    return res.status(400).json({ message: 'userId obligatoire' });
  }

  const user = await store.findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur introuvable' });
  }

  const guide = await store.addMember(guideId, userId);
  if (!guide) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }

  return res.json(await store.toFrontGuide(guide, req.authUser!.userId));
});

router.delete('/:id/members/:userId', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const userId = String(req.params.userId);
  const guide = await store.removeMember(guideId, userId);
  if (!guide) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }

  return res.json(await store.toFrontGuide(guide, req.authUser!.userId));
});

router.post('/:id/activities', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const { title, description, category, address, phone, openingHours, website, startTime, endTime, dayNumbers } =
    req.body as {
      title?: string;
      description?: string;
      category?: ActivityCategory;
      address?: string;
      phone?: string;
      openingHours?: string;
      website?: string;
      startTime?: string;
      endTime?: string;
      dayNumbers?: number[];
    };

  if (
    !title || !description || !category || !address || !phone || !openingHours || !website ||
    !dayNumbers || dayNumbers.length === 0
  ) {
    return res.status(400).json({
      message: 'title, description, category, address, phone, openingHours, website, dayNumbers sont obligatoires',
    });
  }

  if (!categories.includes(category)) {
    return res.status(400).json({ message: 'category invalide' });
  }

  const activity = await store.addActivity(guideId, {
    title, description, category, address, phone, openingHours, website, startTime, endTime, dayNumbers,
  });

  if (!activity) {
    return res.status(404).json({ message: 'Guide introuvable' });
  }

  return res.status(201).json(activity);
});

router.put('/:id/activities/:activityId', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const activityId = String(req.params.activityId);
  const { title, description, category, address, phone, openingHours, website, startTime, endTime, dayNumbers } =
    req.body as {
      title?: string;
      description?: string;
      category?: ActivityCategory;
      address?: string;
      phone?: string;
      openingHours?: string;
      website?: string;
      startTime?: string;
      endTime?: string;
      dayNumbers?: number[];
    };

  if (category && !categories.includes(category)) {
    return res.status(400).json({ message: 'category invalide' });
  }

  const activity = await store.updateActivity(guideId, activityId, {
    title, description, category, address, phone, openingHours, website, startTime, endTime, dayNumbers,
  });

  if (!activity) {
    return res.status(404).json({ message: 'Guide ou activite introuvable' });
  }

  return res.json(activity);
});

router.delete('/:id/activities/:activityId', requireRole('admin'), async (req, res) => {
  const guideId = String(req.params.id);
  const activityId = String(req.params.activityId);
  const deleted = await store.deleteActivity(guideId, activityId);
  if (!deleted) {
    return res.status(404).json({ message: 'Guide ou activite introuvable' });
  }
  return res.status(204).send();
});

export default router;
