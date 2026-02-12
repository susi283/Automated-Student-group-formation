import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cgpa: { type: Number, required: true },
  skills: { type: [String], default: [] },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
