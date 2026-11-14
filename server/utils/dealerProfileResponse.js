function serializeDealerProfile(profile) {
  return {
    id: profile._id, user: profile.user,
    companyName: profile.companyName, phone: profile.phone, address: profile.address,
    status: profile.status, canPostCars: profile.status === 'approved',
    rejectionReason: profile.status === 'rejected' ? profile.rejectionReason : '',
    lastModeration: profile.moderation?.at ? { lastAction: profile.moderation.lastAction, at: profile.moderation.at } : null,
    createdAt: profile.createdAt, updatedAt: profile.updatedAt,
  };
}
module.exports = { serializeDealerProfile };
