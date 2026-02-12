import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  aiNotes: { type: String }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
