/**
 * Video Processor Service - Optimized with Resource Management
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const { EventEmitter } = require('events');

class VideoProcessor extends EventEmitter {
  constructor() {
    super();
    this.currentProcess = null;
    this.isProcessing = false;
  }

  async process(options, progressCallback) {
    if (this.isProcessing) {
      throw new Error('Another video is currently being processed');
    }

    try {
      this.isProcessing = true;
      this.emit('processing:started', options);

      // Validate and optimize options
      const optimizedOptions = await this.optimizeProcessingOptions(options);
      console.log('Optimized processing options:', optimizedOptions);
      
      const result = await this.enhanceVideo(optimizedOptions, progressCallback);
      
      this.isProcessing = false;
      this.emit('processing:completed', result);
      
      return result;
    } catch (error) {
      this.isProcessing = false;
      this.emit('processing:error', error);
      throw error;
    }
  }

  async optimizeProcessingOptions(options) {
    const { inputPath, scaleFactor, enhancementMode, outputQuality } = options;
    
    // Get input video metadata
    const metadata = await this.getVideoMetadata(inputPath);
    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    
    if (!videoStream) {
      throw new Error('No video stream found in input file');
    }

    const inputWidth = videoStream.width;
    const inputHeight = videoStream.height;
    const inputDuration = metadata.format.duration;
    
    console.log(`Input video: ${inputWidth}x${inputHeight}, duration: ${inputDuration}s`);
    
    // Calculate output dimensions
    let finalScaleFactor = scaleFactor;
    const outputWidth = inputWidth * finalScaleFactor;
    const outputHeight = inputHeight * finalScaleFactor;
    
    // Limit maximum output resolution to prevent crashes
    const MAX_WIDTH = 3840; // 4K width
    const MAX_HEIGHT = 2160; // 4K height
    const MAX_PIXELS = 8294400; // 4K total pixels
    
    const outputPixels = outputWidth * outputHeight;
    
    if (outputWidth > MAX_WIDTH || outputHeight > MAX_HEIGHT || outputPixels > MAX_PIXELS) {
      // Calculate a safer scale factor
      const widthRatio = MAX_WIDTH / inputWidth;
      const heightRatio = MAX_HEIGHT / inputHeight;
      const pixelRatio = Math.sqrt(MAX_PIXELS / (inputWidth * inputHeight));
      
      finalScaleFactor = Math.min(widthRatio, heightRatio, pixelRatio, finalScaleFactor);
      finalScaleFactor = Math.max(1, Math.floor(finalScaleFactor * 10) / 10); // Round down to 1 decimal
      
      console.log(`⚠️  Reduced scale factor from ${scaleFactor}x to ${finalScaleFactor}x to prevent system overload`);
      console.log(`   Original target: ${outputWidth}x${outputHeight}`);
      console.log(`   Adjusted target: ${Math.round(inputWidth * finalScaleFactor)}x${Math.round(inputHeight * finalScaleFactor)}`);
    }
    
    // Adjust quality for large files
    let adjustedQuality = outputQuality;
    if (inputDuration > 60 && finalScaleFactor > 2) {
      adjustedQuality = 'high'; // Use high instead of ultra for long videos
      console.log('⚠️  Adjusted quality to "high" for long video to improve processing speed');
    }
    
    return {
      ...options,
      scaleFactor: finalScaleFactor,
      outputQuality: adjustedQuality,
      originalScaleFactor: scaleFactor,
      inputDimensions: { width: inputWidth, height: inputHeight },
      outputDimensions: { 
        width: Math.round(inputWidth * finalScaleFactor), 
        height: Math.round(inputHeight * finalScaleFactor) 
      }
    };
  }

  async enhanceVideo(options, progressCallback) {
    return new Promise((resolve, reject) => {
      const {
        inputPath,
        outputPath,
        scaleFactor,
        enhancementMode = 'standard',
        noiseReduction = 50,
        outputQuality = 'high',
        outputDimensions
      } = options;

      console.log('Processing video with optimized settings:', {
        input: inputPath,
        output: outputPath,
        scale: scaleFactor,
        targetResolution: `${outputDimensions.width}x${outputDimensions.height}`,
        mode: enhancementMode,
        quality: outputQuality
      });

      // Create FFmpeg command with memory management
      const command = ffmpeg(inputPath);
      
      // Set memory and thread limits
      command
        .outputOptions([
          '-threads', '0', // Use all available CPU threads
          '-preset', this.getPresetForQuality(outputQuality),
          '-avoid_negative_ts', 'make_zero'
        ]);

      // Apply enhancement filters
      const filters = this.buildVideoFilters({
        scaleFactor,
        enhancementMode,
        noiseReduction,
        targetWidth: outputDimensions.width,
        targetHeight: outputDimensions.height
      });

      if (filters.length > 0) {
        console.log('Applying filters:', filters);
        command.videoFilters(filters);
      }

      // Set output quality with optimizations
      this.applyQualitySettings(command, outputQuality);

      // Enhanced progress tracking
      let lastProgress = 0;
      command.on('progress', (progress) => {
        const percent = Math.round(progress.percent || 0);
        
        // Only update if progress actually changed
        if (percent !== lastProgress && percent >= 0 && percent <= 100) {
          lastProgress = percent;
          console.log(`Processing progress: ${percent}% - ${progress.timemark || 'Unknown'}`);
          
          if (progressCallback) {
            progressCallback({
              percent,
              currentTime: progress.timemark || '00:00:00',
              targetSize: progress.targetSize || 'Calculating...',
              fps: progress.currentFps || 0,
              speed: progress.currentSpeed || '0x'
            });
          }
        }
      });

      // Handle completion
      command.on('end', async () => {
        console.log('Video processing completed successfully');
        
        try {
          const stats = await fs.stat(outputPath);
          console.log(`✅ Output file created: ${outputPath}`);
          console.log(`📁 File size: ${this.formatFileSize(stats.size)}`);
          
          resolve({
            inputPath,
            outputPath,
            outputSize: stats.size,
            outputSizeFormatted: this.formatFileSize(stats.size),
            finalScaleFactor: scaleFactor,
            outputDimensions,
            message: 'Video processing completed successfully'
          });
        } catch (error) {
          reject(new Error(`Output file verification failed: ${error.message}`));
        }
      });

      // Enhanced error handling
      command.on('error', (error) => {
        console.error('FFmpeg error details:', {
          message: error.message,
          code: error.code,
          signal: error.signal
        });
        
        let errorMessage = 'Video processing failed';
        
        if (error.message.includes('SIGKILL')) {
          errorMessage = 'Processing was stopped due to high memory usage. Try a smaller scale factor or lower quality setting.';
        } else if (error.message.includes('No space left')) {
          errorMessage = 'Not enough disk space for the output file.';
        } else if (error.message.includes('Permission denied')) {
          errorMessage = 'Permission denied. Check file permissions and try a different output location.';
        } else if (error.message.includes('Invalid data')) {
          errorMessage = 'Invalid video format or corrupted input file.';
        }
        
        reject(new Error(errorMessage));
      });

      // Add timeout for very long processing
      const timeout = setTimeout(() => {
        console.log('Processing timeout reached, cancelling...');
        command.kill('SIGTERM');
        reject(new Error('Processing timed out. Try with smaller scale factor or shorter video.'));
      }, 30 * 60 * 1000); // 30 minutes timeout

      // Clear timeout on completion
      command.on('end', () => clearTimeout(timeout));
      command.on('error', () => clearTimeout(timeout));

      // Start processing
      this.currentProcess = command;
      
      try {
        command.save(outputPath);
        console.log('FFmpeg command started with optimizations');
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Failed to start FFmpeg: ${error.message}`));
      }
    });
  }

  buildVideoFilters(options) {
    const { scaleFactor, enhancementMode, noiseReduction, targetWidth, targetHeight } = options;
    const filters = [];

    // Use explicit dimensions for better control
    if (scaleFactor > 1) {
      const algorithm = this.getScalingAlgorithm(enhancementMode);
      filters.push(`scale=${targetWidth}:${targetHeight}:flags=${algorithm}`);
    }

    // Noise reduction (lighter for performance)
    if (noiseReduction > 0) {
      const strength = Math.min(noiseReduction / 100, 0.8); // Cap at 0.8 for performance
      filters.push(`hqdn3d=${strength}:${strength}:${strength * 0.5}:${strength * 0.5}`);
    }

    // Enhancement based on mode (optimized)
    switch (enhancementMode) {
      case 'sharp':
        filters.push('unsharp=3:3:0.8:3:3:0.0'); // Reduced intensity
        break;
      case 'smooth':
        filters.push('avgblur=1'); // Reduced blur
        break;
      case 'anime':
        filters.push('unsharp=2:2:0.6:2:2:0.0'); // Optimized for anime
        break;
    }

    return filters;
  }

  getScalingAlgorithm(mode) {
    switch (mode) {
      case 'sharp':
        return 'lanczos';
      case 'smooth':
        return 'bicubic';
      case 'anime':
        return 'spline';
      default:
        return 'bicubic';
    }
  }

  getPresetForQuality(quality) {
    switch (quality) {
      case 'ultra':
        return 'slow';
      case 'high':
        return 'medium';
      case 'lossless':
        return 'veryslow';
      default:
        return 'fast';
    }
  }

  applyQualitySettings(command, quality) {
    switch (quality) {
      case 'ultra':
        command
          .videoCodec('libx264')
          .outputOptions(['-crf', '20', '-maxrate', '10M', '-bufsize', '20M']);
        break;
      case 'high':
        command
          .videoCodec('libx264')
          .outputOptions(['-crf', '23', '-maxrate', '8M', '-bufsize', '16M']);
        break;
      case 'lossless':
        command
          .videoCodec('libx264')
          .outputOptions(['-crf', '0', '-maxrate', '50M', '-bufsize', '100M']);
        break;
      default:
        command
          .videoCodec('libx264')
          .outputOptions(['-crf', '25', '-maxrate', '5M', '-bufsize', '10M']);
    }
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  async cancel() {
    if (this.currentProcess && this.isProcessing) {
      return new Promise((resolve) => {
        console.log('Cancelling video processing...');
        
        this.currentProcess.on('error', () => {
          // Ignore errors when cancelling
          resolve();
        });
        
        // Try graceful termination first
        this.currentProcess.kill('SIGTERM');
        
        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (this.isProcessing) {
            this.currentProcess.kill('SIGKILL');
          }
        }, 5000);
        
        this.isProcessing = false;
        this.currentProcess = null;
        
        setTimeout(resolve, 1000);
      });
    }
  }

  async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (error, metadata) => {
        if (error) {
          reject(error);
        } else {
          resolve(metadata);
        }
      });
    });
  }
}

module.exports = { VideoProcessor };
