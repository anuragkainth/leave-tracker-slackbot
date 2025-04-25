function isManager(userId) {
    const mgrs = process.env.MANAGER_IDS ? process.env.MANAGER_IDS.split(',') : [];
    return mgrs.includes(userId);
  }
  module.exports = { isManager };