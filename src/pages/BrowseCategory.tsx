import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Send, BookOpen } from 'lucide-react';
import { NILKHET_CATEGORIES } from '@/constants/nilkhetCategories';

const BrowseCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [academicDepartmentId, setAcademicDepartmentId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  const debouncedSearch = useDebounce(search, 300);

  const isAcademic = category !== 'non-academic';
  const bookType = category === 'non-academic' ? 'non_academic' : 'academic';

  const filters = useMemo(() => ({
    search: debouncedSearch,
    subcategory: subcategory || undefined,
    bookType: bookType as 'academic' | 'non_academic',
    // For academic, filter by department if selected, otherwise show user's department
    departmentId: isAcademic ? (departmentId || profile?.department_id || undefined) : undefined,
    academicDepartmentId: isAcademic ? (academicDepartmentId || profile?.academic_department_id || undefined) : undefined,
    // For non-academic, filter by category/subcategory
    nonAcademicCategory: !isAcademic ? (selectedCategory || undefined) : undefined,
    nonAcademicSubcategory: !isAcademic ? (selectedSubcategory || undefined) : undefined,
  }), [debouncedSearch, subcategory, bookType, isAcademic, departmentId, academicDepartmentId, profile?.department_id, profile?.academic_department_id, selectedCategory, selectedSubcategory]);

  const { data: books = [], isLoading } = useBooks(filters);

  const title = isAcademic ? 'In Your Campus' : 'Outside Campus';
  const description = isAcademic 
    ? 'Showing books from your department' 
    : 'Browse non-academic books from all users';

  const departmentActions = [
    {
      title: 'Request A Book To Seniors/Juniors',
      description: 'Ask your department for a book',
      icon: Send,
      href: '/department-requests',
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Requested Books',
      description: 'See what others need',
      icon: BookOpen,
      href: '/department-requests?tab=browse',
      color: 'bg-secondary/80 text-secondary-foreground',
    },
  ];

  // Get subcategories for selected category
  const categoryObj = NILKHET_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Department Actions for Academic */}
        {isAcademic && (
          <div className="grid grid-cols-2 gap-3">
            {departmentActions.map((action) => (
              <Link key={action.title} to={action.href}>
                <Card className="h-full hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-foreground truncate">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Non-Academic Category Filters */}
        {!isAcademic && (
          <div className="space-y-4">
            {/* Category Filters */}
            <div>
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
              <div>
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
          </div>
        )}

        {isAcademic && (
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            subcategory={subcategory}
            onSubcategoryChange={setSubcategory}
            departmentId={departmentId}
            onDepartmentIdChange={setDepartmentId}
            academicDepartmentId={academicDepartmentId}
            onAcademicDepartmentIdChange={setAcademicDepartmentId}
            hideFilters={false}
          />
        )}

        {!isAcademic && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <BookGrid
          books={books}
          loading={isLoading}
          emptyMessage={
            search
              ? 'No books found matching your search'
              : 'No books available yet'
          }
        />
      </div>
    </Layout>
  );
};

export default BrowseCategoryPage;