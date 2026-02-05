import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Star, MapPin, Phone, Search, BookOpen } from 'lucide-react';
import { useShops, useShopBooks } from '@/hooks/useShops';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';

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

  const categoryObj = NILKHET_CATEGORIES.find((c) => c.id === selectedCategory);

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Nilkhet Book Market
            </h1>
            <p className="text-muted-foreground">
              Browse shops and books from Nilkhet
            </p>
          </div>
          <Link to="/shop">
            <Button variant="outline">
              <Store className="h-4 w-4 mr-2" />
              Shop Login
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={viewMode === 'shops' ? 'Search shops...' : 'Search books...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'shops' ? 'default' : 'outline'}
            onClick={() => setViewMode('shops')}
          >
            <Store className="h-4 w-4 mr-2" />
            Shops
          </Button>
          <Button
            variant={viewMode === 'books' ? 'default' : 'outline'}
            onClick={() => setViewMode('books')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Books
          </Button>
        </div>

        {viewMode === 'books' && (
          <>
            {/* Condition Type Tabs */}
            <Tabs value={conditionType} onValueChange={(v) => setConditionType(v as 'old' | 'new')} className="mb-6">
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="new">New Books</TabsTrigger>
                <TabsTrigger value="old">Old Books</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Category Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                  }}
                >
                  All
                </Badge>
                {NILKHET_CATEGORIES.map((cat) => (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubcategory('');
                    }}
                  >
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Subcategory Filters */}
            {categoryObj && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {categoryObj.name} - Subcategories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedSubcategory === '' ? 'secondary' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedSubcategory('')}
                  >
                    All
                  </Badge>
                  {categoryObj.subcategories.map((sub) => (
                    <Badge
                      key={sub.id}
                      variant={selectedSubcategory === sub.id ? 'secondary' : 'outline'}
                      className="cursor-pointer"
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
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted" />
                    <CardContent className="p-3">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No books found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredBooks.map((book) => (
                  <Link key={book.id} to={`/nilkhet/book/${book.id}`}>
                    <Card className="group overflow-hidden hover:shadow-card-hover transition-all">
                      <div className="aspect-[3/4] bg-muted overflow-hidden">
                        {book.photo_url ? (
                          <img
                            src={book.photo_url}
                            alt={book.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          by {book.author}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-primary">
                            ৳{book.price.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {book.book_condition_type === 'new' ? 'New' : 'Old'}
                          </Badge>
                        </div>
                        {book.shop && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {book.shop.name}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === 'shops' && (
          <>
            {/* Shops Grid */}
            {shopsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredShops.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No shops found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShops.map((shop) => (
                  <Link key={shop.id} to={`/nilkhet/shop/${shop.id}`}>
                    <Card className="group hover:shadow-card-hover transition-all h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {shop.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span>{shop.rating_average.toFixed(1)}</span>
                              <span>({shop.rating_count} reviews)</span>
                            </div>
                            {shop.address && (
                              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{shop.address}</span>
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              {shop.phone_number}
                            </p>
                          </div>
                        </div>
                        {shop.description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                            {shop.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          {shop.is_verified && (
                            <Badge variant="success" className="text-xs">Verified</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default NilkhetPage;
