/**
 * System Service
 */

const os = require('os');

class SystemService {
  async getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      memory: os.totalmem(),
      cpus: os.cpus().length
    };
  }
}

module.exports = { SystemService };
