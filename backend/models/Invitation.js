const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['viewer', 'editor', 'admin'],
    default: 'editor'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true,
    // Auto-delete expired invitations after 7 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema);