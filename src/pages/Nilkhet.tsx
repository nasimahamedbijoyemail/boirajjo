import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Star, MapPin, Phone, Search, BookOpen, CheckCircle } from 'lucide-react';
import { useShops, useShopBooks } from '@/hooks/useShops';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

const ShopCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </CardContent>
  </Card>
);

const BookCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-[4/3]" />
    <CardContent className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
    </CardContent>
  </Card>
);

const NilkhetPage = () => {
  const [conditionType, setConditionType] = useState<'old' | 'new'>('new');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'shops' | 'books'>('shops');

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: books = [], isLoading: booksLoading } = useShopBooks(undefined, {
    condition_type: conditionType,
    category: selectedCategory || undefined,
    subcategory: selectedSubcategory || undefined,
  });

  const queryClient = useQueryClient();
  const categoryObj = NILKHET_CATEGORIES.find((c) => c.id === selectedCategory);

  const handleRefresh = useCallback(() => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['shops'] }),
      queryClient.invalidateQueries({ queryKey: ['shop-books'] }),
    ]);
  }, [queryClient]);

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <SEOHead
        title="Nilkhet Book Market"
        description="Browse and order books from Nilkhet book market shops online. New and used books with home delivery across Bangladesh."
        path="/nilkhet"
      />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="container py-6 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              📚 Nilkhet Book Market
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover books from trusted Nilkhet shops
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={viewMode === 'shops' ? 'Search shops by name or area…' : 'Search books by title or author…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'shops' ? 'default' : 'outline'}
              onClick={() => setViewMode('shops')}
              className="gap-2"
            >
              <Store className="h-4 w-4" />
              Shops
              {!shopsLoading && (
                <Badge variant={viewMode === 'shops' ? 'secondary' : 'outline'} className="text-xs h-5 px-1.5">
                  {filteredShops.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={viewMode === 'books' ? 'default' : 'outline'}
              onClick={() => setViewMode('books')}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Books
            </Button>
          </div>

          {/* Books Section */}
          {viewMode === 'books' && (
            <div className="space-y-5">
              {/* Condition Type */}
              <Tabs value={conditionType} onValueChange={(v) => setConditionType(v as 'old' | 'new')}>
                <TabsList className="grid w-full max-w-xs grid-cols-2">
                  <TabsTrigger value="new">New Books</TabsTrigger>
                  <TabsTrigger value="old">Old Books</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Category Filters */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    className="cursor-pointer select-none"
                    onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }}
                  >
                    All
                  </Badge>
                  {NILKHET_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(''); }}
                    >
                      {cat.icon} {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Subcategory Filters */}
              {categoryObj && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {categoryObj.name} — Subcategory
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedSubcategory === '' ? 'secondary' : 'outline'}
                      className="cursor-pointer select-none"
                      onClick={() => setSelectedSubcategory('')}
                    >
                      All
                    </Badge>
                    {categoryObj.subcategories.map((sub) => (
                      <Badge
                        key={sub.id}
                        variant={selectedSubcategory === sub.id ? 'secondary' : 'outline'}
                        className="cursor-pointer select-none"
                        onClick={() => setSelectedSubcategory(sub.id)}
                      >
                        {sub.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Books Grid */}
              {booksLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => <BookCardSkeleton key={i} />)}
                </div>
              ) : filteredBooks.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <BookOpen className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-1">No Books Found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'No books listed in this category yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredBooks.map((book) => (
                    <Link key={book.id} to={`/nilkhet/book/${book.id}`}>
                      <Card className="group overflow-hidden hover:shadow-card-hover transition-all duration-200 h-full">
                        <div className="aspect-[4/3] bg-muted overflow-hidden">
                          {book.photo_url ? (
                            <img
                              src={book.photo_url}
                              alt={book.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors text-sm">
                            {book.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            by {book.author}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-primary">
                              ৳{book.price.toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-xs h-5">
                              {book.book_condition_type === 'new' ? 'New' : 'Old'}
                            </Badge>
                          </div>
                          {book.shop && (
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                              <Store className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{book.shop.name}</span>
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shops Section */}
          {viewMode === 'shops' && (
            <div>
              {shopsLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => <ShopCardSkeleton key={i} />)}
                </div>
              ) : filteredShops.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Store className="h-14 w-14 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="font-medium text-foreground mb-1">No Shops Found</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'No shops are available yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredShops.map((shop) => (
                    <Link key={shop.id} to={`/nilkhet/shop/${shop.id}`}>
                      <Card className="group hover:shadow-card-hover transition-all duration-200 h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Shop Logo */}
                            {shop.logo_url ? (
                              <img
                                src={shop.logo_url}
                                alt={shop.name}
                                className="h-14 w-14 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Store className="h-7 w-7 text-primary" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                  {shop.name}
                                </h3>
                                {shop.is_verified && (
                                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                                <Star className="h-3 w-3 fill-warning text-warning flex-shrink-0" />
                                <span className="font-medium">{(shop.rating_average || 0).toFixed(1)}</span>
                                <span>({shop.rating_count || 0})</span>
                              </div>

                              {shop.address && (
                                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{shop.address}</span>
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {shop.phone_number}
                              </p>
                            </div>
                          </div>

                          {shop.description && (
                            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                              {shop.description}
                            </p>
                          )}

                          {shop.is_verified && (
                            <div className="mt-3">
                              <Badge variant="success" className="text-xs">Verified Shop</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </PullToRefresh>
    </Layout>
  );
};

export default NilkhetPage;
