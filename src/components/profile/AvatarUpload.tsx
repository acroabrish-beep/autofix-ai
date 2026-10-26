import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, User, Loader2, Trash2 } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { Button } from '../ui/Button';

interface AvatarUploadProps {
  currentFileId?: string;
  onUploadComplete: (fileId: string) => Promise<void>;
  onRemove: () => Promise<void>;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentFileId, onUploadComplete, onRemove }) => {
  const { t } = useTranslation();
  const { uploadFile, deleteFile, getFilePreview, uploading, BUCKETS } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setError(t('shared.image_only'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('shared.file_too_large'));
      return;
    }

    setError(null);
    try {
      const response = await uploadFile(BUCKETS.AVATARS, file);
      await onUploadComplete(response.$id);

      // Cleanup old avatar if it exists
      if (currentFileId) {
        await deleteFile(BUCKETS.AVATARS, currentFileId);
      }
    } catch (err: any) {
      setError(err.message || t('shared.upload_failed'));
    }
  };

  const handleRemove = async () => {
    if (!currentFileId) return;
    try {
      await onRemove();
      await deleteFile(BUCKETS.AVATARS, currentFileId);
    } catch (err: any) {
      setError(err.message || t('shared.remove_failed'));
    }
  };

  const avatarUrl = currentFileId ? getFilePreview(BUCKETS.AVATARS, currentFileId) : null;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={t('common.avatar')} className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-slate-300" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-brand-navy/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 bg-brand-blue text-white rounded-full shadow-lg hover:bg-brand-blue/90 transition-all border-2 border-white"
          disabled={uploading}
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs text-slate-500">{t('shared.avatar_hint')}</p>
        {currentFileId && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <Trash2 className="w-4 h-4" /> {t('shared.remove_photo')}
          </Button>
        )}
        {localError && <p className="text-xs text-red-500 font-medium">{localError}</p>}
      </div>
    </div>
  );
};
