import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useBook, useUpdateBook } from '@/hooks/useBooks';
import { BookCondition } from '@/types/database';
import { toast } from 'sonner';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  price: z.number().min(1, 'Price must be at least ৳1').max(100000),
  condition: z.enum(['new', 'good', 'worn']),
});

const conditionOptions = [
  { value: 'new', label: 'New - Like new condition' },
  { value: 'good', label: 'Good - Minor wear' },
  { value: 'worn', label: 'Worn - Visible wear but usable' },
];

const EditBookPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading } = useBook(id || '');
  const updateBook = useUpdateBook();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'good' as BookCondition,
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        price: book.price.toString(),
        condition: book.condition,
      });
      setPhotoUrl(book.photo_url || '');
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = bookSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price) || 0,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await updateBook.mutateAsync({
        id: id!,
        title: formData.title.trim(),
        author: formData.author.trim(),
        price: parseFloat(formData.price),
        condition: formData.condition,
        photo_url: photoUrl || null,
      });
      toast.success('Book updated successfully!');
      navigate('/my-listings');
    } catch (error) {
      toast.error('Failed to update book. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 max-w-2xl">
          <Skeleton className="h-10 w-24 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Book Photo (Optional)</Label>
                <div className="flex items-center gap-4">
                  {photoUrl ? (
                    <div className="relative">
                      <img
                        src={photoUrl}
                        alt="Book preview"
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 w-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Upload</span>
                    </label>
                  )}
                  <div className="flex-1">
                    <Input
                      placeholder="Or paste image URL"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste a URL to an image of your book
                    </p>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={handleChange}
                  className={errors.author ? 'border-destructive' : ''}
                />
                {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, condition: value as BookCondition }))
                  }
                >
                  <SelectTrigger className={errors.condition ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-sm text-destructive">{errors.condition}</p>}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={updateBook.isPending}
              >
                {updateBook.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditBookPage;
