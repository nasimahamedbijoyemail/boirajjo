import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAllEuProducts,
  useCreateEuProduct,
  useUpdateEuProduct,
} from '@/hooks/useEuProducts';
import { Plus, Pencil, Package, MapPin, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AdminEuProductsTab = () => {
  const { data: products = [], isLoading } = useAllEuProducts();
  const createProduct = useCreateEuProduct();
  const updateProduct = useUpdateEuProduct();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', author: '', category: 'books', subcategory: '',
    description: '', price: '', condition: 'good', photo_url: '',
    stock: '1', city: '', country: 'EU',
    delivery_days_min: '2', delivery_days_max: '5', featured: false,
    is_available: true, currency: 'EUR',
  });

  const resetForm = () => {
    setForm({
      title: '', author: '', category: 'books', subcategory: '',
      description: '', price: '', condition: 'good', photo_url: '',
      stock: '1', city: '', country: 'EU',
      delivery_days_min: '2', delivery_days_max: '5', featured: false,
      is_available: true, currency: 'EUR',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(
      {
        title: form.title, author: form.author, category: form.category,
        subcategory: form.subcategory || null, description: form.description || null,
        price: parseFloat(form.price), condition: form.condition,
        photo_url: form.photo_url || null, stock: parseInt(form.stock),
        city: form.city || null, country: form.country || 'EU',
        delivery_days_min: parseInt(form.delivery_days_min),
        delivery_days_max: parseInt(form.delivery_days_max),
        featured: form.featured, is_available: form.is_available, currency: form.currency,
      },
      { onSuccess: () => { resetForm(); setOpen(false); } }
    );
  };

  const toggleAvailability = (id: string, current: boolean) => {
    updateProduct.mutate({ id, is_available: !current });
  };

  const toggleFeatured = (id: string, current: boolean) => {
    updateProduct.mutate({ id, featured: !current });
  };

  if (isLoading) {
    return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">EU Products ({products.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="rounded-xl">
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add EU Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input placeholder="Title *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
              <Input placeholder="Author *" value={form.author} onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
                <Input placeholder="Subcategory" value={form.subcategory} onChange={(e) => setForm(f => ({ ...f, subcategory: e.target.value }))} />
              </div>
              <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-3 gap-3">
                <Input placeholder="Price *" type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} required />
                <Input placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} />
                <select className="border rounded-md px-3 py-2 text-sm bg-background" value={form.condition} onChange={(e) => setForm(f => ({ ...f, condition: e.target.value }))}>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="worn">Used</option>
                </select>
              </div>
              <Input placeholder="Photo URL" value={form.photo_url} onChange={(e) => setForm(f => ({ ...f, photo_url: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City" value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
                <Input placeholder="Country" value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Min delivery days" type="number" value={form.delivery_days_min} onChange={(e) => setForm(f => ({ ...f, delivery_days_min: e.target.value }))} />
                <Input placeholder="Max delivery days" type="number" value={form.delivery_days_max} onChange={(e) => setForm(f => ({ ...f, delivery_days_max: e.target.value }))} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Featured</label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm(f => ({ ...f, featured: v }))} />
              </div>
              <Button type="submit" disabled={createProduct.isPending} className="w-full rounded-xl">
                {createProduct.isPending ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No EU products yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <Card key={p.id} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-foreground">{p.title}</h3>
                      {p.featured && <Badge className="bg-category-eu text-white text-[10px]"><Star className="h-3 w-3 mr-0.5" />Featured</Badge>}
                      <Badge variant={p.is_available ? 'secondary' : 'destructive'} className="text-[10px]">
                        {p.is_available ? 'Available' : 'Hidden'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.author} · €{p.price} · Stock: {p.stock}</p>
                    {p.city && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{p.city}, {p.country}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(p.id, p.featured)}
                    >
                      <Star className={`h-3.5 w-3.5 ${p.featured ? 'fill-category-eu text-category-eu' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(p.id, p.is_available)}
                    >
                      {p.is_available ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEuProductsTab;
