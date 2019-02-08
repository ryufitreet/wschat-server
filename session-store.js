const expressSession = require('express-session');
const sessionStore = new expressSession.MemoryStore();

module.exports = sessionStore;