
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  buttonText?: string;
  uploading?: boolean;
  progress?: number;
  error?: string | null;
  onClear?: () => void;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*,video/*,application/pdf",
  maxSize = 500 * 1024 * 1024, // 500MB default
  label = "Upload File",
  description = "Drag and drop your file here or click to browse",
  buttonText = "Select File",
  uploading = false,
  progress = 0,
  error = null,
  onClear
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size exceeds the limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file).catch(error => {
      console.error("Error in file selection:", error);
      // Error display is handled by the uploading state and error prop
    });
  };
  
  const clearFile = () => {
    setSelectedFile(null);
    if (onClear) {
      onClear();
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!selectedFile && !uploading ? (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your file here or click below to browse
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept={accept}
                onChange={handleChange}
                disabled={uploading}
              />
              <label htmlFor="file-upload">
                <Button 
                  variant="secondary" 
                  className="mt-2" 
                  disabled={uploading}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  {buttonText}
                </Button>
              </label>
            </>
          ) : (
            <div className="w-full">
              {selectedFile && (
                <div className="flex items-center justify-between bg-muted p-3 rounded-md mb-4">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <div className="shrink-0">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearFile}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              {uploading && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Supported formats: Images, Videos, PDF documents</p>
        <p>Max size: {Math.round(maxSize / (1024 * 1024))}MB</p>
      </CardFooter>
    </Card>
  );
}
