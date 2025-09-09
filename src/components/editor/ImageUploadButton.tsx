'use client'

import { useRef, useState } from 'react'
import { Image, Upload, X, Link } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'

interface ImageUploadButtonProps {
  articleId: string
  onImageInsert: (markdown: string) => void
}

export function ImageUploadButton({ articleId, onImageInsert }: ImageUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [useUrl, setUseUrl] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadArticleImage, isUploading, progress, error } = useFileUpload()

  const handleFileSelect = async (file: File) => {
    const result = await uploadArticleImage(articleId, file)
    if (result) {
      insertImage(result.url, file.name)
      closeModal()
    }
  }

  const handleUrlSubmit = () => {
    if (imageUrl) {
      insertImage(imageUrl, altText || 'Image')
      closeModal()
    }
  }

  const insertImage = (url: string, alt: string) => {
    const markdown = `![${alt}](${url})`
    onImageInsert(markdown)
  }

  const closeModal = () => {
    setIsOpen(false)
    setUseUrl(false)
    setImageUrl('')
    setAltText('')
  }

  return (
    <>
      <button
        className="editor-toolbar__button"
        onClick={() => setIsOpen(true)}
        title="画像を挿入"
      >
        <Image size={18} />
      </button>

      {isOpen && (
        <div className="image-upload-modal" onClick={closeModal}>
          <div className="image-upload-modal__content" onClick={e => e.stopPropagation()}>
            <div className="image-upload-modal__header">
              <h3>画像を挿入</h3>
              <button onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="image-upload-modal__tabs">
              <button
                className={`tab ${!useUrl ? 'active' : ''}`}
                onClick={() => setUseUrl(false)}
              >
                <Upload size={16} />
                アップロード
              </button>
              <button
                className={`tab ${useUrl ? 'active' : ''}`}
                onClick={() => setUseUrl(true)}
              >
                <Link size={16} />
                URLを入力
              </button>
            </div>

            {!useUrl ? (
              <div className="image-upload-modal__upload">
                <div 
                  className="upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="upload-progress">
                      <div className="upload-progress__bar">
                        <div 
                          className="upload-progress__fill"
                          style={{ width: `${progress?.percentage || 0}%` }}
                        />
                      </div>
                      <span>{progress?.percentage || 0}%</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} />
                      <p>クリックまたはドラッグ&ドロップ</p>
                      <span>JPG, PNG, GIF, WebP, SVG (最大10MB)</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="image-upload-modal__url">
                <input
                  type="url"
                  placeholder="画像のURLを入力"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="代替テキスト（任意）"
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  className="input"
                />
                <button
                  className="btn btn--primary"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl}
                >
                  挿入
                </button>
              </div>
            )}

            {error && (
              <div className="image-upload-modal__error">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .editor-toolbar__button {
          padding: 8px;
          background: none;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .editor-toolbar__button:hover {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .image-upload-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .image-upload-modal__content {
          background: var(--color-bg-primary);
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .image-upload-modal__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .image-upload-modal__header h3 {
          font-size: 18px;
          font-weight: 600;
        }

        .image-upload-modal__header button {
          padding: 4px;
          background: none;
          border: none;
          color: var(--color-text-tertiary);
          cursor: pointer;
          transition: color 0.2s;
        }

        .image-upload-modal__header button:hover {
          color: var(--color-text-primary);
        }

        .image-upload-modal__tabs {
          display: flex;
          gap: 4px;
          padding: 20px 20px 0;
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: var(--color-bg-secondary);
          border: none;
          border-radius: 4px 4px 0 0;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab.active {
          background: var(--color-bg-primary);
          color: var(--color-primary);
          font-weight: 600;
        }

        .image-upload-modal__upload {
          padding: 20px;
        }

        .upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          border: 2px dashed var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-area:hover {
          border-color: var(--color-primary);
          background: var(--color-primary-alpha);
        }

        .upload-area p {
          margin: 12px 0 8px;
          font-weight: 500;
        }

        .upload-area span {
          font-size: 14px;
          color: var(--color-text-tertiary);
        }

        .upload-progress {
          width: 100%;
          text-align: center;
        }

        .upload-progress__bar {
          width: 100%;
          height: 8px;
          background: var(--color-bg-secondary);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .upload-progress__fill {
          height: 100%;
          background: var(--color-primary);
          transition: width 0.3s;
        }

        .image-upload-modal__url {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input {
          padding: 12px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-size: 14px;
        }

        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn--primary {
          background: var(--color-primary);
          color: white;
        }

        .btn--primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn--primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .image-upload-modal__error {
          margin: 0 20px 20px;
          padding: 12px;
          background: var(--color-danger-bg);
          color: var(--color-danger);
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </>
  )
}