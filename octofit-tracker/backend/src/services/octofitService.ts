import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Activity payload is required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };

  if (typeof userId !== 'string' || typeof teamId !== 'string' || typeof type !== 'string' || !type.trim()) {
    throw Object.assign(new Error('userId, teamId, type, and minutes are required'), { status: 400 });
  }

  const numericMinutes = Number(minutes);
  if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
    throw Object.assign(new Error('minutes must be a positive number'), { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(teamId)) {
    throw Object.assign(new Error('userId and teamId must be valid ObjectIds'), { status: 400 });
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);

  if (!userExists || !teamExists) {
    throw Object.assign(new Error('userId and teamId must reference existing records'), { status: 400 });
  }

  const createdActivity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes: numericMinutes,
    points: numericMinutes,
    occurredAt: new Date(),
  });

  return createdActivity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Team payload is required'), { status: 400 });
  }

  const { name, mascot, members } = input as { name?: unknown; mascot?: unknown; members?: unknown };
  if (typeof name !== 'string' || !name.trim()) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Team mascot is required'), { status: 400 });
  }

  const memberIds = Array.isArray(members) ? members : [];
  const normalizedMembers: mongoose.Types.ObjectId[] = [];

  for (const member of memberIds) {
    if (typeof member !== 'string' || !mongoose.Types.ObjectId.isValid(member)) {
      throw Object.assign(new Error('All team members must be valid ObjectIds'), { status: 400 });
    }

    if (!(await User.exists({ _id: member }))) {
      throw Object.assign(new Error('All team members must reference existing users'), { status: 400 });
    }

    normalizedMembers.push(new mongoose.Types.ObjectId(member));
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: normalizedMembers,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  if (totals.length === 0) {
    return [];
  }

  const teams = await Team.find({ _id: { $in: totals.map((entry) => entry._id) } }).lean();
  const teamById = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return totals.map((entry, index) => ({
    teamName: teamById.get(entry._id.toString()) ?? 'Unknown',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

function activityFocus(type: string) {
  switch (type.toLowerCase()) {
    case 'run':
      return 'endurance';
    case 'strength':
      return 'strength';
    case 'cycle':
      return 'endurance';
    case 'swim':
      return 'endurance';
    default:
      return 'endurance';
  }
}

export async function suggestWorkouts(userEmail: string) {
  if (!userEmail || typeof userEmail !== 'string') {
    throw Object.assign(new Error('User email is required'), { status: 400 });
  }

  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recent = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const preferredFocus = typeof user.fitnessGoal === 'string' && user.fitnessGoal.trim()
    ? user.fitnessGoal.trim()
    : recent ? activityFocus(recent.type) : 'endurance';

  const candidateFocuses = new Set([preferredFocus, recent ? activityFocus(recent.type) : preferredFocus]);
  const workouts = await Workout.find({ focus: { $in: Array.from(candidateFocuses) } }).lean();

  return workouts.map((workout) => ({
    ...workout,
    reason: recent
      ? `Matches your ${preferredFocus} goal and recent ${recent.type} activity.`
      : `Matches your ${preferredFocus} goal.`,
  }));
}

export { User };
