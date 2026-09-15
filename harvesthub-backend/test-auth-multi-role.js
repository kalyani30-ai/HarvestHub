const assert = require('assert');
const { normalizeRoles, resolveActiveRole, buildAuthPayload } = require('./utils/authService');

const roles = normalizeRoles(['Customer', 'farmer', ' ADMIN ']);
assert.deepStrictEqual(roles, ['customer', 'farmer', 'admin']);

const activeRole = resolveActiveRole(['customer', 'farmer'], 'farmer');
assert.strictEqual(activeRole, 'farmer');

const payload = buildAuthPayload({
  _id: 'abc123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '9999999999',
  roles: ['customer', 'farmer'],
  profile: { address: 'Farm Street', farmName: 'Green Acres' }
}, 'customer');

assert.strictEqual(payload.user.roles.includes('customer'), true);
assert.strictEqual(payload.user.activeRole, 'customer');
assert.strictEqual(payload.user.profile.address, 'Farm Street');
console.log('Auth multi-role tests passed');
