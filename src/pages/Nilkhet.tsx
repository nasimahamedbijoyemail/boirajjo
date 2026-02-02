import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { useBooks } from '@/hooks/useBooks';
import { useDebounce } from '@/hooks/useDebounce';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { NILKHET_CATEGORIES, NilkhetBookConditionType } from '@/constants/nilkhetCategories';
import { cn } from '@/lib/utils';

const NilkhetPage = () => {
  const [search, setSearch] = useState('');
  const [bookCondition, setBookCondition] = useState<NilkhetBookConditionType>('old');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);

  const { data: books = [], isLoading } = useBooks({ 
    bookType: 'nilkhet',
    nilkhetCondition: bookCondition,
    nilkhetSubcategory: selectedSubcategory || undefined,
  });

  const filteredBooks = useMemo(() => {
    if (!debouncedSearch) return books;
    const searchLower = debouncedSearch.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
    );
  }, [books, debouncedSearch]);

  const selectedCategory = NILKHET_CATEGORIES.find(c => c.id === selectedCategoryId);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategoryId(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(subcategoryId);
    }
  };

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategory(null);
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Nilkhet Books
          </h1>
          <p className="text-muted-foreground">
            Order books with cash on delivery
          </p>
        </div>

        {/* Book Condition Tabs */}
        <Tabs value={bookCondition} onValueChange={(v) => {
          setBookCondition(v as NilkhetBookConditionType);
          clearFilters();
        }}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="old" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Old Books
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              New Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value={bookCondition} className="mt-4 space-y-4">
            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {NILKHET_CATEGORIES.map((category) => (
                <Card 
                  key={category.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedCategoryId === category.id && "ring-2 ring-primary bg-primary/5"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{category.icon} {category.name}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      selectedCategoryId === category.id && "rotate-90"
                    )} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Subcategory Pills */}
            {selectedCategory && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">
                    {selectedCategory.icon} {selectedCategory.name}
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategory.subcategories.map((item) => (
                    <Badge
                      key={item.id}
                      variant={selectedSubcategory === item.id ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => handleSubcategoryClick(item.id)}
                    >
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filter Display */}
            {selectedSubcategory && selectedCategory && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Showing:</span>
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory.subcategories.find(
                    (i) => i.id === selectedSubcategory
                  )?.name}
                  <button 
                    onClick={() => setSelectedSubcategory(null)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          subcategory=""
          onSubcategoryChange={() => {}}
          hideFilters
        />

        <BookGrid
          books={filteredBooks}
          loading={isLoading}
          emptyMessage={
            selectedSubcategory 
              ? "No books in this category yet"
              : "No Nilkhet books available yet"
          }
          isNilkhet
        />
      </div>
    </Layout>
  );
};

export default NilkhetPage;
