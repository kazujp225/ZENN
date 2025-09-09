'use client'

import { useState, useRef } from 'react'
import { User, Camera, X, Upload } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ 
  userId, 
  currentAvatarUrl, 
  onUploadComplete 
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadAvatar, isUploading, progress, error, reset } = useFileUpload()

  const handleFileSelect = async (file: File) => {
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    const result = await uploadAvatar(userId, file)
    if (result) {
      onUploadComplete?.(result.url)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const clearPreview = () => {
    setPreviewUrl(null)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="avatar-upload">
      <div 
        className={`avatar-upload__container ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="avatar-upload__preview">
          {displayUrl ? (
            <img 
              src={displayUrl} 
              alt="Avatar" 
              className="avatar-upload__image"
            />
          ) : (
            <div className="avatar-upload__placeholder">
              <User size={48} />
            </div>
          )}
          
          {isUploading && (
            <div className="avatar-upload__progress">
              <div className="avatar-upload__progress-overlay" />
              <div className="avatar-upload__progress-bar">
                <div 
                  className="avatar-upload__progress-fill"
                  style={{ width: `${progress?.percentage || 0}%` }}
                />
              </div>
              <span className="avatar-upload__progress-text">
                {progress?.percentage || 0}%
              </span>
            </div>
          )}

          <button
            className="avatar-upload__change-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change avatar"
          >
            <Camera size={20} />
          </button>

          {previewUrl && !isUploading && (
            <button
              className="avatar-upload__clear-btn"
              onClick={clearPreview}
              aria-label="Clear preview"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="avatar-upload__input"
          disabled={isUploading}
        />

        {!displayUrl && !isUploading && (
          <div className="avatar-upload__hint">
            <Upload size={24} />
            <p>ドラッグ&ドロップまたはクリックで画像をアップロード</p>
            <span>JPG, PNG, GIF, WebP (最大5MB)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="avatar-upload__error">
          {error}
        </div>
      )}

      <style jsx>{`
        .avatar-upload {
          width: 100%;
          max-width: 200px;
        }

        .avatar-upload__container {
          position: relative;
          aspect-ratio: 1;
          border: 2px dashed var(--color-border);
          border-radius: 50%;
          overflow: hidden;
          transition: all 0.2s;
          background: var(--color-bg-secondary);
        }

        .avatar-upload__container.dragging {
          border-color: var(--color-primary);
          background: var(--color-primary-alpha);
        }

        .avatar-upload__preview {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-upload__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-upload__placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
        }

        .avatar-upload__progress {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
        }

        .avatar-upload__progress-bar {
          width: 80%;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          overflow: hidden;
        }

        .avatar-upload__progress-fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s;
        }

        .avatar-upload__progress-text {
          margin-top: 8px;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .avatar-upload__change-btn,
        .avatar-upload__clear-btn {
          position: absolute;
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border);
          border-radius: 50%;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .avatar-upload__change-btn {
          bottom: 0;
          right: 0;
        }

        .avatar-upload__clear-btn {
          top: 0;
          right: 0;
          padding: 4px;
        }

        .avatar-upload__change-btn:hover,
        .avatar-upload__clear-btn:hover {
          background: var(--color-primary);
          color: white;
        }

        .avatar-upload__input {
          display: none;
        }

        .avatar-upload__hint {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          cursor: pointer;
        }

        .avatar-upload__hint p {
          margin: 8px 0 4px;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .avatar-upload__hint span {
          font-size: 12px;
          color: var(--color-text-tertiary);
        }

        .avatar-upload__error {
          margin-top: 8px;
          padding: 8px 12px;
          background: var(--color-danger-bg);
          color: var(--color-danger);
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}