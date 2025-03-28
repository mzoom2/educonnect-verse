
import { useState } from 'react';
import api from '@/services/api';

interface UploadProgressState {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadProgressState>({
    progress: 0,
    isUploading: false,
    error: null
  });

  const uploadFile = async (
    file: File, 
    courseId?: string, 
    type: string = 'document',
    folder: string = 'course-resources'
  ) => {
    try {
      setUploadState({
        progress: 0,
        isUploading: true,
        error: null
      });

      const formData = new FormData();
      formData.append('file', file);
      
      if (courseId) {
        formData.append('course_id', courseId);
      }
      
      formData.append('type', type);
      formData.append('folder', folder);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          
          setUploadState(prev => ({
            ...prev,
            progress: percentCompleted
          }));
        }
      });
      
      setUploadState({
        progress: 100,
        isUploading: false,
        error: null
      });
      
      return {
        id: Date.now().toString(),
        name: response.data.originalName,
        type: response.data.type,
        url: response.data.fileUrl,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      setUploadState({
        progress: 0,
        isUploading: false,
        error: error.response?.data?.message || error.message || 'Upload failed'
      });
      
      throw error;
    }
  };

  return {
    uploadFile,
    ...uploadState
  };
}
