import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  fixtureKey: { type: String, index: true },
  title: { type: String, required: true },
  focus: { type: String, required: true },
  minutes: { type: Number, required: true },
  difficulty: { type: String, required: true },
});

export const Workout = model('Workout', workoutSchema);
