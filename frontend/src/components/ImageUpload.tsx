import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  onDeleteComplete: () => void;
  currentImageUrl?: string | null;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload({ onUploadComplete, onDeleteComplete, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setError('Файл слишком большой. Максимальный размер 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Неверный тип файла. Разрешены: JPEG, PNG, GIF, WebP');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token:', token ? 'exists' : 'missing');
      const response = await axios.post('/api/users/me/image', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Upload success:', response.data);
      onUploadComplete(response.data.image_url);
      setPreview(null);
      toast.success('Фотография загружена');
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const axiosError = err as { response?: { status?: number, data?: { detail?: string } }, message?: string };
      const message = axiosError.response?.data?.detail || axiosError.message || 'Ошибка загрузки';
      console.error('Error message:', message, 'Status:', axiosError.response?.status);
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete('/api/users/me/image', {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeleteComplete();
      toast.success('Фотография удалена');
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('Ошибка удаления');
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
  };

  const displayUrl = currentImageUrl || preview;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Аватар</CardTitle>
        <CardDescription>Загрузите изображение для вашего профиля</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {displayUrl ? (
          <div className="space-y-4">
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-muted">
              <img
                src={displayUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors hover:border-primary
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Перетащите изображение или нажмите для выбора
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG, GIF, WebP до 5MB
              </p>
            </div>

            {preview && (
              <div className="flex items-center justify-center gap-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <Button variant="ghost" size="icon" onClick={clearPreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {uploading && (
              <p className="text-sm text-muted-foreground text-center">
                Загрузка...
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}