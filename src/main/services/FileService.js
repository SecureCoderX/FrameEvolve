/**
 * File Service - Real FFmpeg Implementation
 */

const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;

class FileService {
  async getVideoInfo(filePath) {
    try {
      console.log('Getting video info for:', filePath);
      
      const stats = await fs.stat(filePath);
      const metadata = await this.getVideoMetadata(filePath);
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      const info = {
        filename: path.basename(filePath),
        size: this.formatFileSize(stats.size),
        duration: this.formatDuration(metadata.format.duration),
        resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'Unknown',
        fps: videoStream ? Math.round(eval(videoStream.r_frame_rate)) : 'Unknown',
        codec: videoStream ? videoStream.codec_name.toUpperCase() : 'Unknown',
        bitrate: metadata.format.bit_rate ? `${Math.round(metadata.format.bit_rate / 1000)} kbps` : 'Unknown',
        hasAudio: !!audioStream,
        format: metadata.format.format_name.toUpperCase()
      };
      
      console.log('Video info retrieved:', info);
      return info;
    } catch (error) {
      console.error('Error getting video info:', error);
      return {
        filename: path.basename(filePath),
        size: 'Unknown',
        duration: 'Unknown',
        resolution: 'Unknown',
        error: error.message
      };
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

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return 'Unknown';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async validateVideoFile(filePath) {
    try {
      const metadata = await this.getVideoMetadata(filePath);
      const hasVideo = metadata.streams.some(s => s.codec_type === 'video');
      console.log(`Video validation for ${filePath}: ${hasVideo ? 'Valid' : 'Invalid'}`);
      return hasVideo;
    } catch (error) {
      console.error('Video validation failed:', error);
      return false;
    }
  }
}

module.exports = { FileService };
