/**
 * Frame Evolve - Enhanced Application Controller with Settings Integration
 */

class FrameEvolveApp {
  constructor() {
    this.state = {
      currentFile: null,
      isProcessing: false,
      settings: {}
    };
    
    this.components = {};
    this.init();
  }

  async init() {
    try {
      await this.initializeComponents();
      await this.loadSettings();
      this.setupEventListeners();
      this.setupElectronListeners();
      this.applyInitialSettings();
      
      console.log('Frame Evolve initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Frame Evolve:', error);
    }
  }

  async initializeComponents() {
    // Initialize Settings component first
    this.components.settings = new Settings();
    
    // Wait for settings to load before applying defaults
    await this.components.settings.init();
  }

  async loadSettings() {
    try {
      this.state.settings = this.components.settings.getSettings();
      console.log('App settings loaded:', this.state.settings);
    } catch (error) {
      console.error('Failed to load app settings:', error);
      this.state.settings = {};
    }
  }

  applyInitialSettings() {
    // Apply default values to enhancement controls
    const scaleFactor = this.state.settings.defaultScaleFactor || '2';
    const enhancementMode = this.state.settings.defaultEnhancementMode || 'sharp';
    const outputQuality = this.state.settings.defaultOutputQuality || 'high';
    const noiseReduction = this.state.settings.defaultNoiseReduction || 50;

    // Set enhancement control defaults
    this.setSelectValue('scale-factor', scaleFactor);
    this.setSelectValue('enhancement-mode', enhancementMode);
    this.setSelectValue('output-quality', outputQuality);
    this.setRangeValue('noise-reduction', noiseReduction);

    // Apply theme
    const theme = this.state.settings.appTheme || 'dark';
    this.applyTheme(theme);

    console.log('Initial settings applied to UI');
  }

  setupEventListeners() {
    // Title bar controls
    document.getElementById('minimize-btn')?.addEventListener('click', () => {
      window.electronAPI.window.minimize();
    });

    document.getElementById('maximize-btn')?.addEventListener('click', () => {
      window.electronAPI.window.maximize();
    });

    document.getElementById('close-btn')?.addEventListener('click', () => {
      window.electronAPI.window.close();
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        this.handleNavigation(tab);
      });
    });

    // File upload
    this.setupFileUploadListeners();

    // Enhancement controls with settings awareness
    this.setupEnhancementControlListeners();

    // Process button
    document.getElementById('process-btn')?.addEventListener('click', () => {
      this.startProcessing();
    });

    // Cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      this.cancelProcessing();
    });
  }

  setupFileUploadListeners() {
    const uploadArea = document.getElementById('upload-area');
    const browseBtn = document.getElementById('browse-btn');

    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          this.handleFileSelected(files[0].path);
        }
      });

      uploadArea.addEventListener('click', () => {
        this.selectVideoFile();
      });
    }

    if (browseBtn) {
      browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectVideoFile();
      });
    }
  }

  setupEnhancementControlListeners() {
    // Noise reduction slider
    const noiseReduction = document.getElementById('noise-reduction');
    const noiseValue = document.getElementById('noise-value');
    
    if (noiseReduction && noiseValue) {
      noiseReduction.addEventListener('input', (e) => {
        noiseValue.textContent = e.target.value + '%';
      });
    }

    // Save current settings as new defaults when changed
    ['scale-factor', 'enhancement-mode', 'output-quality'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.saveCurrentAsDefaults();
      });
    });

    document.getElementById('noise-reduction')?.addEventListener('change', () => {
      this.saveCurrentAsDefaults();
    });
  }

  async saveCurrentAsDefaults() {
    try {
      const currentSettings = this.getEnhancementOptions();
      
      // Update settings component
      await this.components.settings.updateSetting('defaultScaleFactor', currentSettings.scaleFactor.toString());
      await this.components.settings.updateSetting('defaultEnhancementMode', currentSettings.enhancementMode);
      await this.components.settings.updateSetting('defaultOutputQuality', currentSettings.outputQuality);
      await this.components.settings.updateSetting('defaultNoiseReduction', currentSettings.noiseReduction);
      
      // Update local state
      this.state.settings = this.components.settings.getSettings();
      
      console.log('Current settings saved as defaults');
    } catch (error) {
      console.error('Failed to save current settings as defaults:', error);
    }
  }

  setupElectronListeners() {
    window.electronAPI.on('video:progress', (event, progress) => {
      this.updateProgress(progress);
    });

    window.electronAPI.on('video:complete', (event, result) => {
      this.handleProcessComplete(result);
    });

    window.electronAPI.on('video:error', (event, error) => {
      this.handleProcessError(error);
    });
  }

  handleNavigation(tab) {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const selectedTab = document.getElementById(`${tab}-tab`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(`[data-tab="${tab}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }
  }

  async selectVideoFile() {
    try {
      const filePath = await window.electronAPI.file.selectVideo();
      if (filePath) {
        await this.handleFileSelected(filePath);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      this.showNotification('Failed to select video file', 'error');
    }
  }

  async handleFileSelected(filePath) {
    try {
      const isValid = await window.electronAPI.file.validate(filePath);
      if (!isValid) {
        this.showNotification('Invalid video file format', 'error');
        return;
      }

      const fileInfo = await window.electronAPI.file.getInfo(filePath);
      
      this.state.currentFile = {
        path: filePath,
        info: fileInfo
      };

      this.showVideoPreview(filePath, fileInfo);
      this.showProcessingRecommendations(fileInfo);
      
      console.log('File selected:', filePath);
      
      if (this.state.settings.showNotifications) {
        this.showNotification('Video file loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load file:', error);
      this.showNotification('Failed to load video file', 'error');
    }
  }

  showProcessingRecommendations(fileInfo) {
    const scaleFactor = parseInt(document.getElementById('scale-factor')?.value || '2');
    const [width, height] = fileInfo.resolution.split('x').map(Number);
    
    if (width && height) {
      const outputWidth = width * scaleFactor;
      const outputHeight = height * scaleFactor;
      
      let recommendation = '';
      let type = 'info';
      
      if (outputWidth > 3840 || outputHeight > 2160) {
        recommendation = `⚠️ Warning: ${scaleFactor}x upscaling will create a ${outputWidth}x${outputHeight} video, which may be too large. Consider 2x scaling.`;
        type = 'warning';
      } else if (scaleFactor >= 3 && (width >= 1920 || height >= 1080)) {
        recommendation = `💡 Tip: ${scaleFactor}x scaling of HD video will take significant time and storage.`;
      } else {
        recommendation = `✅ Good: ${scaleFactor}x scaling will create a ${outputWidth}x${outputHeight} video.`;
      }
      
      if (this.state.settings.showNotifications) {
        this.showNotification(recommendation, type);
      }
    }
  }

  showVideoPreview(filePath, fileInfo) {
    const uploadSection = document.querySelector('.upload-section');
    const videoSection = document.getElementById('video-section');
    const videoPreview = document.getElementById('video-preview');
    const videoInfoElement = document.getElementById('video-info');

    if (uploadSection) uploadSection.style.display = 'none';
    if (videoSection) videoSection.classList.remove('hidden');

    if (videoPreview) {
      videoPreview.src = `file://${filePath}`;
    }

    if (videoInfoElement && fileInfo) {
      videoInfoElement.innerHTML = `
        <div class="video-info-item">
          <span class="video-info-label">Filename:</span>
          <span>${fileInfo.filename}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Duration:</span>
          <span>${fileInfo.duration}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Resolution:</span>
          <span>${fileInfo.resolution}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Size:</span>
          <span>${fileInfo.size}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Format:</span>
          <span>${fileInfo.format}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">FPS:</span>
          <span>${fileInfo.fps}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Codec:</span>
          <span>${fileInfo.codec}</span>
        </div>
        <div class="video-info-item">
          <span class="video-info-label">Bitrate:</span>
          <span>${fileInfo.bitrate}</span>
        </div>
      `;
    }
  }

  async startProcessing() {
    if (this.state.isProcessing || !this.state.currentFile) {
      return;
    }

    try {
      // Use default output path if set, otherwise prompt
      let outputPath = this.state.settings.defaultOutputPath;
      
      if (!outputPath) {
        outputPath = await window.electronAPI.file.selectOutput();
        if (!outputPath) return;
      } else {
        // Generate filename in default directory
        const filename = `enhanced-${Date.now()}.mp4`;
        outputPath = `${outputPath}/${filename}`;
      }

      const options = this.getEnhancementOptions();
      options.inputPath = this.state.currentFile.path;
      options.outputPath = outputPath;

      // Apply performance settings
      options.priority = this.state.settings.processingPriority;
      options.memoryLimit = this.state.settings.memoryLimit;
      options.timeout = this.state.settings.processingTimeout * 60 * 1000; // Convert to ms

      this.state.isProcessing = true;
      this.showProgress();

      await window.electronAPI.video.process(options);
      
    } catch (error) {
      console.error('Failed to start processing:', error);
      this.handleProcessError(error.message);
    }
  }

  getEnhancementOptions() {
    return {
      scaleFactor: parseInt(document.getElementById('scale-factor')?.value || '2'),
      enhancementMode: document.getElementById('enhancement-mode')?.value || 'sharp',
      noiseReduction: parseInt(document.getElementById('noise-reduction')?.value || '50'),
      outputQuality: document.getElementById('output-quality')?.value || 'high'
    };
  }

  showProgress() {
    const videoSection = document.getElementById('video-section');
    const progressSection = document.getElementById('progress-section');
    const processBtn = document.getElementById('process-btn');

    if (videoSection) videoSection.style.display = 'none';
    if (progressSection) progressSection.classList.remove('hidden');
    if (processBtn) processBtn.disabled = true;
  }

  hideProgress() {
    const videoSection = document.getElementById('video-section');
    const progressSection = document.getElementById('progress-section');
    const processBtn = document.getElementById('process-btn');

    if (videoSection) videoSection.style.display = 'grid';
    if (progressSection) progressSection.classList.add('hidden');
    if (processBtn) processBtn.disabled = false;
  }

  updateProgress(progress) {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressTime = document.getElementById('progress-time');

    if (progressFill) {
      progressFill.style.width = `${progress.percent}%`;
    }

    if (progressText) {
      progressText.textContent = `${progress.percent}%`;
    }

    if (progressTime) {
      let timeText = '';
      if (progress.currentTime) {
        timeText += `Time: ${progress.currentTime}`;
      }
      if (progress.fps) {
        timeText += ` • ${progress.fps} fps`;
      }
      if (progress.speed) {
        timeText += ` • ${progress.speed}`;
      }
      progressTime.textContent = timeText || 'Processing...';
    }
  }

  async cancelProcessing() {
    try {
      await window.electronAPI.video.cancel();
      this.state.isProcessing = false;
      this.hideProgress();
      
      if (this.state.settings.showNotifications) {
        this.showNotification('Processing cancelled', 'warning');
      }
    } catch (error) {
      console.error('Failed to cancel processing:', error);
    }
  }

  async handleProcessComplete(result) {
    this.state.isProcessing = false;
    this.hideProgress();
    
    let message = 'Video processing completed successfully!';
    if (result.outputSizeFormatted) {
      message += ` Output size: ${result.outputSizeFormatted}`;
    }
    
    if (this.state.settings.showNotifications) {
      this.showNotification(message, 'success');
    }
    
    // Auto-open output folder if enabled
    if (this.state.settings.autoOpenOutput && result.outputPath) {
      try {
        await window.electronAPI.system.openPath(result.outputPath);
      } catch (error) {
        console.error('Failed to open output folder:', error);
      }
    }
    
    console.log('Processing completed:', result);
  }

  handleProcessError(error) {
    this.state.isProcessing = false;
    this.hideProgress();
    
    if (this.state.settings.showNotifications) {
      this.showNotification(error, 'error');
    }
    
    console.error('Processing error:', error);
  }

  // Helper methods
  setSelectValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
    }
  }

  setRangeValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.value = value;
      // Update display
      const displayElement = document.getElementById('noise-value');
      if (displayElement) {
        displayElement.textContent = value + '%';
      }
    }
  }

  applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    
    // Update CSS custom properties based on theme
    const root = document.documentElement;
    
    switch (theme) {
      case 'light':
        root.style.setProperty('--primary-bg', '#ffffff');
        root.style.setProperty('--secondary-bg', '#f8fafc');
        root.style.setProperty('--tertiary-bg', '#e2e8f0');
        root.style.setProperty('--text-primary', '#1e293b');
        root.style.setProperty('--text-secondary', '#475569');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--border-color', '#cbd5e1');
        break;
      case 'auto':
        // Detect system theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(prefersDark ? 'dark' : 'light');
        return;
      case 'dark':
      default:
        // Reset to default dark theme
        root.style.setProperty('--primary-bg', '#0f0f0f');
        root.style.setProperty('--secondary-bg', '#1a1a1a');
        root.style.setProperty('--tertiary-bg', '#2d2d2d');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a1a1aa');
        root.style.setProperty('--text-muted', '#71717a');
        root.style.setProperty('--border-color', '#404040');
        break;
    }
    
    console.log(`Applied theme: ${theme}`);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, type === 'error' ? 8000 : 5000);
  }

  // Public methods for other components
  getAppSettings() {
    return { ...this.state.settings };
  }

  async updateAppSetting(key, value) {
    try {
      await this.components.settings.updateSetting(key, value);
      this.state.settings = this.components.settings.getSettings();
      
      // Apply certain settings immediately
      if (key === 'appTheme') {
        this.applyTheme(value);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to update app setting ${key}:`, error);
      return false;
    }
  }

  refreshSettings() {
    this.state.settings = this.components.settings.getSettings();
    this.applyInitialSettings();
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.frameEvolveApp = new FrameEvolveApp();
});
