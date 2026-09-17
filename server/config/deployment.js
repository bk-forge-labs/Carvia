function deploymentConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  if (production && !env.CORS_ORIGINS) throw new Error('CORS_ORIGINS is required in production.');
  if (production && !env.UPLOAD_DIR) throw new Error('UPLOAD_DIR must point to persistent storage in production.');
  if (production && (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET.includes('CHANGE_ME'))) throw new Error('Set a strong JWT_SECRET of at least 32 characters.');
  const origins = (env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(',').map(x => x.trim()).filter(Boolean);
  if (!origins.length) throw new Error('At least one CORS origin is required.');
  for (const origin of origins) {
    const url = new URL(origin);
    if (!['http:','https:'].includes(url.protocol) || url.origin !== origin || (production && url.protocol !== 'https:')) throw new Error('CORS_ORIGINS must contain exact origins, using HTTPS in production.');
  }
  return {origins};
}
module.exports = {deploymentConfig};
