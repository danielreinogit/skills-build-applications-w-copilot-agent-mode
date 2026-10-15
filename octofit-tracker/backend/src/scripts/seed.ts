import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

const demoFixtures = {
  teams: {
    octocats: { name: 'Octocats', mascot: 'Mona' },
    robocats: { name: 'Robocats', mascot: 'Hubot' },
  },
  users: {
    mona: { name: 'Mona', email: 'mona@example.com', fitnessGoal: 'endurance' },
    hubot: { name: 'Hubot', email: 'hubot@example.com', fitnessGoal: 'strength' },
  },
  activities: {
    monaRun: { type: 'run', minutes: 40, points: 40, occurredAt: new Date('2026-01-10T12:00:00.000Z') },
    hubotCycle: { type: 'cycle', minutes: 25, points: 25, occurredAt: new Date('2026-01-11T12:00:00.000Z') },
  },
  workouts: {
    intervals: { title: 'Intervals', focus: 'endurance', minutes: 30, difficulty: 'moderate' },
    strengthCircuit: { title: 'Strength Circuit', focus: 'strength', minutes: 30, difficulty: 'moderate' },
  },
} as const;

async function upsertDemoUser(fixtureKey: string, teamId: InstanceType<typeof Team>['_id'], name: string, email: string, fitnessGoal: string) {
  const previousUser = await User.findOne({ $or: [{ fixtureKey }, { email }] }).select('_id team fixtureKey');
  if (previousUser?.team && previousUser.team.toString() !== teamId.toString()) {
    await Team.updateOne({ _id: previousUser.team }, { $pull: { members: previousUser._id } });
  }

  const user = await User.findOneAndUpdate(
    { $or: [{ fixtureKey }, { email }] },
    { $set: { fixtureKey, name, email, team: teamId, fitnessGoal } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await Team.updateOne({ _id: teamId }, { $addToSet: { members: user._id } });
  return user;
}

export async function seed() {
  await connectDatabase();
  try {
    const octocats = await Team.findOneAndUpdate(
      { $or: [{ fixtureKey: 'team:octocats' }, { name: demoFixtures.teams.octocats.name }] },
      { $set: { fixtureKey: 'team:octocats', name: demoFixtures.teams.octocats.name, mascot: demoFixtures.teams.octocats.mascot } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const robocats = await Team.findOneAndUpdate(
      { $or: [{ fixtureKey: 'team:robocats' }, { name: demoFixtures.teams.robocats.name }] },
      { $set: { fixtureKey: 'team:robocats', name: demoFixtures.teams.robocats.name, mascot: demoFixtures.teams.robocats.mascot } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const mona = await upsertDemoUser(
      'user:mona',
      octocats._id,
      demoFixtures.users.mona.name,
      demoFixtures.users.mona.email,
      demoFixtures.users.mona.fitnessGoal,
    );
    const hubot = await upsertDemoUser(
      'user:hubot',
      robocats._id,
      demoFixtures.users.hubot.name,
      demoFixtures.users.hubot.email,
      demoFixtures.users.hubot.fitnessGoal,
    );

    await Activity.findOneAndUpdate(
      { fixtureKey: 'activity:mona:run' },
      {
        $set: {
          fixtureKey: 'activity:mona:run',
          user: mona._id,
          team: octocats._id,
          type: demoFixtures.activities.monaRun.type,
          minutes: demoFixtures.activities.monaRun.minutes,
          points: demoFixtures.activities.monaRun.points,
          occurredAt: demoFixtures.activities.monaRun.occurredAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Activity.findOneAndUpdate(
      { fixtureKey: 'activity:hubot:cycle' },
      {
        $set: {
          fixtureKey: 'activity:hubot:cycle',
          user: hubot._id,
          team: robocats._id,
          type: demoFixtures.activities.hubotCycle.type,
          minutes: demoFixtures.activities.hubotCycle.minutes,
          points: demoFixtures.activities.hubotCycle.points,
          occurredAt: demoFixtures.activities.hubotCycle.occurredAt,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Workout.findOneAndUpdate(
      { fixtureKey: 'workout:intervals' },
      { $set: { fixtureKey: 'workout:intervals', ...demoFixtures.workouts.intervals } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await Workout.findOneAndUpdate(
      { fixtureKey: 'workout:strength-circuit' },
      { $set: { fixtureKey: 'workout:strength-circuit', ...demoFixtures.workouts.strengthCircuit } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
