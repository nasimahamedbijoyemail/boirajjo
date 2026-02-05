import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
 import { ArrowLeft } from 'lucide-react';
 import { PhotoUpload } from '@/components/ui/photo-upload';
import { useCreateBook } from '@/hooks/useBooks';
import { BookCondition, BookType } from '@/types/database';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';
import { toast } from 'sonner';
import { z } from 'zod';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  price: z.number().min(1, 'Price must be at least ৳1').max(100000),
  condition: z.enum(['new', 'good', 'worn']),
  book_type: z.enum(['academic', 'non_academic']),
});

const conditionOptions = [
  { value: 'new', label: 'New - Like new condition' },
  { value: 'good', label: 'Good - Minor wear' },
  { value: 'worn', label: 'Worn - Visible wear but usable' },
];

const bookTypeOptions = [
  { value: 'academic', label: 'Academic - Course books, textbooks' },
  { value: 'non_academic', label: 'Non-Academic - Novels, general books' },
];

const AddBookPage = () => {
  const navigate = useNavigate();
  const createBook = useCreateBook();
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    condition: 'good' as BookCondition,
    book_type: 'academic' as BookType,
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Non-academic category selection
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const categoryObj = NILKHET_CATEGORIES.find((c) => c.id === selectedCategory);

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

    // Validate category for non-academic books
    if (formData.book_type === 'non_academic' && (!selectedCategory || !selectedSubcategory)) {
      toast.error('Please select a category and subcategory for non-academic books');
      return;
    }

    try {
      await createBook.mutateAsync({
        title: formData.title.trim(),
        author: formData.author.trim(),
        price: parseFloat(formData.price),
        condition: formData.condition,
        book_type: formData.book_type,
        photo_url: photoUrl || null,
        category: formData.book_type === 'non_academic' ? selectedCategory : undefined,
        subcategory_detail: formData.book_type === 'non_academic' ? selectedSubcategory : undefined,
      });
      toast.success('Book listed successfully!');
      navigate('/my-listings');
    } catch {
      toast.error('Failed to list book. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl">Sell a Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Book Photo (Optional)</Label>
                 <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
              </div>

              {/* Book Type */}
              <div className="space-y-2">
                <Label>Book Type *</Label>
                <Select
                  value={formData.book_type}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, book_type: value as BookType }));
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Academic books are visible only to your campus. Non-academic books are visible to everyone.
                </p>
              </div>

              {/* Category selection for non-academic books */}
              {formData.book_type === 'non_academic' && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium">Book Category</h3>
                  
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) => {
                        setSelectedCategory(value);
                        setSelectedSubcategory('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {NILKHET_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {categoryObj && (
                    <div className="space-y-2">
                      <Label>Subcategory *</Label>
                      <Select
                        value={selectedSubcategory}
                        onValueChange={setSelectedSubcategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryObj.subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

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
                disabled={createBook.isPending}
              >
                {createBook.isPending ? 'Listing...' : 'List Book for Sale'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddBookPage;
