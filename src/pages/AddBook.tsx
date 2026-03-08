import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Camera, BookOpen } from 'lucide-react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useCreateBook } from '@/hooks/useBooks';
import { BookCondition, BookType } from '@/types/database';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';
import { toast } from 'sonner';
import { SEOHead } from '@/components/seo/SEOHead';
import { z } from 'zod';
import { motion } from 'framer-motion';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  price: z.number().min(1, 'Price must be at least ৳1').max(100000),
  condition: z.enum(['new', 'good', 'worn']),
  book_type: z.enum(['academic', 'non_academic']),
});

const conditionOptions = [
  { value: 'new', label: 'New', desc: 'Like new condition' },
  { value: 'good', label: 'Good', desc: 'Minor wear' },
  { value: 'worn', label: 'Worn', desc: 'Visible wear but usable' },
];

const bookTypeOptions = [
  { value: 'academic', label: 'Academic', desc: 'Course books, textbooks' },
  { value: 'non_academic', label: 'Non-Academic', desc: 'Novels, general books' },
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
      toast.success('Book listed successfully! 🎉');
      navigate('/my-listings');
    } catch {
      toast.error('Failed to list book. Please try again.');
    }
  };

  return (
    <Layout>
      <SEOHead title="Sell a Book" description="List your book for sale on Boi Rajjo campus marketplace." path="/add-book" />
      <div className="container py-4 sm:py-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="shadow-card border-0 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl">Sell a Book</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">List your book and connect with buyers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Photo Upload - more prominent */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    Book Photo <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <PhotoUpload value={photoUrl} onChange={setPhotoUrl} folder="books" />
                </div>

                {/* Book Type - chips style */}
                <div className="space-y-2">
                  <Label>Book Type *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {bookTypeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, book_type: opt.value as BookType }));
                          setSelectedCategory('');
                          setSelectedSubcategory('');
                        }}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          formData.book_type === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <span className={`text-sm font-semibold ${formData.book_type === opt.value ? 'text-primary' : 'text-foreground'}`}>
                          {opt.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Academic books are visible only to your campus. Non-academic books are visible to everyone.
                  </p>
                </div>

                {/* Category selection for non-academic books */}
                {formData.book_type === 'non_academic' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 p-4 bg-muted/40 rounded-xl border border-border/50"
                  >
                    <h3 className="font-medium text-sm">Book Category</h3>
                    
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
                  </motion.div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Introduction to Algorithms"
                    value={formData.title}
                    onChange={handleChange}
                    className={`h-12 rounded-xl ${errors.title ? 'border-destructive' : ''}`}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    name="author"
                    placeholder="e.g. Thomas H. Cormen"
                    value={formData.author}
                    onChange={handleChange}
                    className={`h-12 rounded-xl ${errors.author ? 'border-destructive' : ''}`}
                  />
                  {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price (৳) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">৳</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleChange}
                      className={`h-12 rounded-xl pl-8 text-lg font-semibold ${errors.price ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                {/* Condition - chips */}
                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {conditionOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, condition: opt.value as BookCondition }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.condition === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <span className={`text-sm font-semibold ${formData.condition === opt.value ? 'text-primary' : 'text-foreground'}`}>
                          {opt.label}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {errors.condition && <p className="text-sm text-destructive">{errors.condition}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-sm"
                  size="lg"
                  disabled={createBook.isPending}
                >
                  {createBook.isPending ? 'Listing...' : 'List Book for Sale'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AddBookPage;
