import { Schema, model } from 'mongoose';

const teamSchema = new Schema({
  fixtureKey: { type: String, index: true },
  name: { type: String, required: true },
  mascot: { type: String, required: true },
  members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
});

export const Team = model('Team', teamSchema);
