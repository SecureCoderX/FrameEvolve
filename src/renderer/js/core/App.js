/**
 * Frame Evolve - Enhanced App with Better Processing Feedback
 */

class FrameEvolveApp {
  constructor() {
    this.state = {
      currentFile: null,
      isProcessing: false,
      settings: {}
    };
    
    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      this.setupEventListeners();
      this.setupElectronListeners();
      
      console.log('Frame Evolve initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Frame Evolve:', error);
    }
  }

  async loadSettings() {
    try {
      this.state.settings = await window.electronAPI.settings.getAll();
      this.applySettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.state.settings = {};
    }
  }

  applySettings() {
    const defaultQuality = this.state.settings.defaultQuality || 'high'; // Changed default to 'high'
    const defaultScale = this.state.settings.defaultScale || '2'; // Changed default to '2'
    
    const qualitySelect = document.getElementById('default-quality');
    const scaleSelect = document.getElementById('default-scale');
    const outputQualitySelect = document.getElementById('output-quality');
    const scaleFactorSelect = document.getElementById('scale-factor');
    
    if (qualitySelect) qualitySelect.value = defaultQuality;
    if (scaleSelect) scaleSelect.value = defaultScale;
    if (outputQualitySelect) outputQualitySelect.value = defaultQuality;
    if (scaleFactorSelect) scaleFactorSelect.value = defaultScale;
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

    // Enhancement controls
    const noiseReduction = document.getElementById('noise-reduction');
    const noiseValue = document.getElementById('noise-value');
    
    if (noiseReduction && noiseValue) {
      noiseReduction.addEventListener('input', (e) => {
        noiseValue.textContent = e.target.value + '%';
      });
    }

    // Process button
    document.getElementById('process-btn')?.addEventListener('click', () => {
      this.startProcessing();
    });

    // Cancel button
    document.getElementById('cancel-btn')?.addEventListener('click', () => {
      this.cancelProcessing();
    });

    // Settings
    document.getElementById('default-quality')?.addEventListener('change', (e) => {
      this.saveSetting('defaultQuality', e.target.value);
    });

    document.getElementById('default-scale')?.addEventListener('change', (e) => {
      this.saveSetting('defaultScale', e.target.value);
    });
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
      this.showNotification('Video file loaded successfully', 'success');
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
      
      if (outputWidth > 3840 || outputHeight > 2160) {
        recommendation = `⚠️ Warning: ${scaleFactor}x upscaling will create a ${outputWidth}x${outputHeight} video, which may be too large. Consider 2x scaling.`;
      } else if (scaleFactor >= 3 && (width >= 1920 || height >= 1080)) {
        recommendation = `💡 Tip: ${scaleFactor}x scaling of HD video will take significant time and storage.`;
      } else {
        recommendation = `✅ Good: ${scaleFactor}x scaling will create a ${outputWidth}x${outputHeight} video.`;
      }
      
      // Show recommendation in UI
      this.showNotification(recommendation, outputWidth > 3840 ? 'warning' : 'info');
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
      const outputPath = await window.electronAPI.file.selectOutput();
      if (!outputPath) {
        return;
      }

      const options = this.getEnhancementOptions();
      options.inputPath = this.state.currentFile.path;
      options.outputPath = outputPath;

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
      this.showNotification('Processing cancelled', 'warning');
    } catch (error) {
      console.error('Failed to cancel processing:', error);
    }
  }

  handleProcessComplete(result) {
    this.state.isProcessing = false;
    this.hideProgress();
    
    let message = 'Video processing completed successfully!';
    if (result.outputSizeFormatted) {
      message += ` Output size: ${result.outputSizeFormatted}`;
    }
    
    this.showNotification(message, 'success');
    
    console.log('Processing completed:', result);
  }

  handleProcessError(error) {
    this.state.isProcessing = false;
    this.hideProgress();
    this.showNotification(error, 'error');
    
    console.error('Processing error:', error);
  }

  async saveSetting(key, value) {
    try {
      await window.electronAPI.settings.set(key, value);
      this.state.settings[key] = value;
      console.log(`Setting saved: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
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
    }, type === 'error' ? 8000 : 5000); // Show errors longer
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.frameEvolveApp = new FrameEvolveApp();
});
