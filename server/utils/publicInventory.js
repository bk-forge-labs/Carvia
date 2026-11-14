function publicInventory(env = process.env) { return { isPublished: true, ...(env.NODE_ENV === 'production' ? { isDemo: { $ne: true } } : {}) }; }
module.exports = { publicInventory };
