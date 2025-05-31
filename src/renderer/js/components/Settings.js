/**
 * Settings Component
 * Handles all settings-related functionality
 */

class Settings {
  constructor() {
    this.settings = {};
    this.defaults = {
      // Default Enhancement Settings
      defaultScaleFactor: '2',
      defaultEnhancementMode: 'sharp',
      defaultOutputQuality: 'high',
      defaultNoiseReduction: 50,
      
      // Application Settings
      appTheme: 'dark',
      defaultOutputPath: '',
      autoOpenOutput: false,
      showNotifications: true,
      
      // Performance Settings
      processingPriority: 'normal',
      memoryLimit: 'balanced',
      autoPauseBattery: true,
      processingTimeout: 30
    };
    
    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      this.setupEventListeners();
      this.populateUI();
      await this.loadSystemInfo();
      
      console.log('Settings component initialized');
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }
  }

  async loadSettings() {
    try {
      this.settings = await window.electronAPI.settings.getAll();
      
      // Merge with defaults for any missing settings
      this.settings = { ...this.defaults, ...this.settings };
      
      console.log('Settings loaded:', this.settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { ...this.defaults };
    }
  }

  setupEventListeners() {
    // Default Enhancement Settings
    document.getElementById('default-scale-factor')?.addEventListener('change', (e) => {
      this.updateSetting('defaultScaleFactor', e.target.value);
    });

    document.getElementById('default-enhancement-mode')?.addEventListener('change', (e) => {
      this.updateSetting('defaultEnhancementMode', e.target.value);
    });

    document.getElementById('default-output-quality')?.addEventListener('change', (e) => {
      this.updateSetting('defaultOutputQuality', e.target.value);
    });

    document.getElementById('default-noise-reduction')?.addEventListener('input', (e) => {
      this.updateSetting('defaultNoiseReduction', parseInt(e.target.value));
      document.getElementById('default-noise-value').textContent = e.target.value + '%';
    });

    // Application Settings
    document.getElementById('app-theme')?.addEventListener('change', (e) => {
      this.updateSetting('appTheme', e.target.value);
      this.applyTheme(e.target.value);
    });

    document.getElementById('browse-output-path')?.addEventListener('click', () => {
      this.browseOutputPath();
    });

    document.getElementById('auto-open-output')?.addEventListener('change', (e) => {
      this.updateSetting('autoOpenOutput', e.target.checked);
    });

    document.getElementById('show-notifications')?.addEventListener('change', (e) => {
      this.updateSetting('showNotifications', e.target.checked);
    });

    // Performance Settings
    document.getElementById('processing-priority')?.addEventListener('change', (e) => {
      this.updateSetting('processingPriority', e.target.value);
    });

    document.getElementById('memory-limit')?.addEventListener('change', (e) => {
      this.updateSetting('memoryLimit', e.target.value);
    });

    document.getElementById('auto-pause-battery')?.addEventListener('change', (e) => {
      this.updateSetting('autoPauseBattery', e.target.checked);
    });

    document.getElementById('processing-timeout')?.addEventListener('change', (e) => {
      this.updateSetting('processingTimeout', parseInt(e.target.value));
    });

    // Action buttons
    document.getElementById('save-settings')?.addEventListener('click', () => {
      this.saveSettings();
    });

    document.getElementById('reset-settings')?.addEventListener('click', () => {
      this.resetSettings();
    });

    document.getElementById('export-settings')?.addEventListener('click', () => {
      this.exportSettings();
    });

    document.getElementById('import-settings')?.addEventListener('click', () => {
      this.importSettings();
    });
  }

  populateUI() {
    try {
      // Default Enhancement Settings
      this.setSelectValue('default-scale-factor', this.settings.defaultScaleFactor);
      this.setSelectValue('default-enhancement-mode', this.settings.defaultEnhancementMode);
      this.setSelectValue('default-output-quality', this.settings.defaultOutputQuality);
      this.setRangeValue('default-noise-reduction', this.settings.defaultNoiseReduction);

      // Application Settings
      this.setSelectValue('app-theme', this.settings.appTheme);
      this.setInputValue('default-output-path', this.settings.defaultOutputPath);
      this.setCheckboxValue('auto-open-output', this.settings.autoOpenOutput);
      this.setCheckboxValue('show-notifications', this.settings.showNotifications);

      // Performance Settings
      this.setSelectValue('processing-priority', this.settings.processingPriority);
      this.setSelectValue('memory-limit', this.settings.memoryLimit);
      this.setCheckboxValue('auto-pause-battery', this.settings.autoPauseBattery);
      this.setSelectValue('processing-timeout', this.settings.processingTimeout.toString());

      console.log('UI populated with settings');
    } catch (error) {
      console.error('Failed to populate UI:', error);
    }
  }

  setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
    }
  }

  setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value || '';
    }
  }

  setCheckboxValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.checked = Boolean(value);
    }
  }

  setRangeValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
      // Update display
      const displayId = id.replace('default-', '').replace('-', '-') + '-value';
      const display = document.getElementById(displayId);
      if (display) {
        display.textContent = value + '%';
      }
    }
  }

  async updateSetting(key, value) {
    try {
      this.settings[key] = value;
      await window.electronAPI.settings.set(key, value);
      console.log(`Setting updated: ${key} = ${value}`);
      
      // Show temporary success indicator
      this.showSettingsFeedback(`Updated ${key}`, 'success');
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      this.showSettingsFeedback(`Failed to update ${key}`, 'error');
    }
  }

  async browseOutputPath() {
    try {
      const result = await window.electronAPI.file.selectOutputDirectory();
      if (result) {
        this.setInputValue('default-output-path', result);
        await this.updateSetting('defaultOutputPath', result);
      }
    } catch (error) {
      console.error('Failed to browse output path:', error);
      this.showSettingsFeedback('Failed to select directory', 'error');
    }
  }

  applyTheme(theme) {
    // Apply theme to the application
    document.body.className = `theme-${theme}`;
    
    // You can add more theme logic here
    console.log(`Applied theme: ${theme}`);
  }

  async saveSettings() {
    try {
      // Save all current settings
      const allSettings = { ...this.settings };
      
      for (const [key, value] of Object.entries(allSettings)) {
        await window.electronAPI.settings.set(key, value);
      }
      
      this.showSettingsFeedback('All settings saved successfully!', 'success');
      console.log('All settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showSettingsFeedback('Failed to save settings', 'error');
    }
  }

  async resetSettings() {
    try {
      const confirmed = confirm('Are you sure you want to reset all settings to defaults?');
      if (!confirmed) return;

      // Reset to defaults
      this.settings = { ...this.defaults };
      
      // Save defaults
      for (const [key, value] of Object.entries(this.defaults)) {
        await window.electronAPI.settings.set(key, value);
      }
      
      // Update UI
      this.populateUI();
      this.applyTheme(this.defaults.appTheme);
      
      this.showSettingsFeedback('Settings reset to defaults', 'success');
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.showSettingsFeedback('Failed to reset settings', 'error');
    }
  }

  async exportSettings() {
    try {
      const settingsJson = JSON.stringify(this.settings, null, 2);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `frame-evolve-settings-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      this.showSettingsFeedback('Settings exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export settings:', error);
      this.showSettingsFeedback('Failed to export settings', 'error');
    }
  }

  async importSettings() {
    try {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          const importedSettings = JSON.parse(text);
          
          // Validate imported settings
          const validSettings = {};
          for (const key in this.defaults) {
            if (importedSettings.hasOwnProperty(key)) {
              validSettings[key] = importedSettings[key];
            }
          }
          
          // Apply imported settings
          this.settings = { ...this.defaults, ...validSettings };
          
          // Save to storage
          for (const [key, value] of Object.entries(this.settings)) {
            await window.electronAPI.settings.set(key, value);
          }
          
          // Update UI
          this.populateUI();
          this.applyTheme(this.settings.appTheme);
          
          this.showSettingsFeedback('Settings imported successfully', 'success');
        } catch (error) {
          console.error('Failed to import settings:', error);
          this.showSettingsFeedback('Invalid settings file', 'error');
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Failed to import settings:', error);
      this.showSettingsFeedback('Failed to import settings', 'error');
    }
  }

  async loadSystemInfo() {
    try {
      const systemInfo = await window.electronAPI.system.getInfo();
      const versions = await window.electronAPI.system.getVersion();
      
      // Update system info display
      document.getElementById('electron-version').textContent = versions.electron;
      document.getElementById('node-version').textContent = versions.node;
      document.getElementById('platform-info').textContent = `${systemInfo.platform} ${systemInfo.arch}`;
      
      console.log('System info loaded');
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  }

  showSettingsFeedback(message, type = 'info') {
    // Remove any existing feedback
    const existing = document.querySelector('.settings-message');
    if (existing) {
      existing.remove();
    }
    
    // Create new feedback message
    const feedback = document.createElement('div');
    feedback.className = `settings-message ${type}`;
    feedback.textContent = message;
    
    // Insert at top of settings container
    const container = document.querySelector('.settings-container');
    if (container) {
      container.insertBefore(feedback, container.firstChild);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        feedback.remove();
      }, 3000);
    }
  }

  // Public method to get current settings
  getSettings() {
    return { ...this.settings };
  }

  // Public method to get a specific setting
  getSetting(key, defaultValue = null) {
    return this.settings[key] !== undefined ? this.settings[key] : defaultValue;
  }
}

// Make Settings available globally
window.Settings = Settings;
