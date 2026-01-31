import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BookGrid } from '@/components/books/BookGrid';
import { SearchBar } from '@/components/books/SearchBar';
import { Card, CardContent } from '@/components/ui/card';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Send, BookOpen } from 'lucide-react';

const BrowseCategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  const debouncedSearch = useDebounce(search, 300);

  const isAcademic = category !== 'non-academic';
  const bookType = category === 'non-academic' ? 'non_academic' : 'academic';

  const filters = useMemo(() => ({
    search: debouncedSearch,
    subcategory: subcategory === 'all' ? '' : subcategory,
    bookType: bookType as 'academic' | 'non_academic',
    // For academic, filter by department; for non-academic, show all
    departmentId: isAcademic ? (profile?.department_id || undefined) : undefined,
    academicDepartmentId: isAcademic ? (profile?.academic_department_id || undefined) : undefined,
  }), [debouncedSearch, subcategory, bookType, isAcademic, profile?.department_id, profile?.academic_department_id]);

  const { data: books = [], isLoading } = useBooks(filters);

  const title = isAcademic ? 'In Your Campus' : 'Outside Campus';
  const description = isAcademic 
    ? 'Showing books from your department' 
    : 'Browse books from all users';

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

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          subcategory={subcategory}
          onSubcategoryChange={setSubcategory}
          hideFilters={!isAcademic}
        />

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
