/**
 * Configuration Manager - Simple File Storage
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.frame-evolve');
    this.configFile = path.join(this.configDir, 'config.json');
    
    this.defaults = {
      window: {
        width: 1400,
        height: 900
      },
      defaultQuality: 'ultra',
      defaultScale: '4',
      theme: 'dark'
    };
    
    this.config = {};
    this.load();
  }

  load() {
    try {
      // Ensure config directory exists
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }

      // Load existing config or create default
      if (fs.existsSync(this.configFile)) {
        const data = fs.readFileSync(this.configFile, 'utf8');
        this.config = { ...this.defaults, ...JSON.parse(data) };
      } else {
        this.config = { ...this.defaults };
        this.save();
      }
      
      console.log('Configuration loaded successfully');
    } catch (error) {
      console.warn('Failed to load config, using defaults:', error.message);
      this.config = { ...this.defaults };
    }
  }

  save() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
      console.log('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save config:', error.message);
    }
  }

  get(key, defaultValue) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value !== undefined ? value : defaultValue;
  }

  set(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    // Navigate to the parent of the final key
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set the final value
    current[keys[keys.length - 1]] = value;
    
    // Auto-save
    this.save();
  }

  getAll() {
    return { ...this.config };
  }

  reset() {
    this.config = { ...this.defaults };
    this.save();
  }
}

module.exports = { ConfigManager };
