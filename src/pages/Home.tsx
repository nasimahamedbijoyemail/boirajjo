import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Globe, BookMarked, Store } from 'lucide-react';

const categories = [
  {
    title: 'In Your Campus',
    description: 'Books from your department',
    icon: GraduationCap,
    href: '/browse/academic',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    title: 'Outside Campus',
    description: 'General books from everyone',
    icon: Globe,
    href: '/browse/non-academic',
    color: 'bg-green-500/10 text-green-600',
  },
  {
    title: 'Demand For A Book',
    description: 'Request a book you need',
    icon: BookMarked,
    href: '/book-demand',
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    title: 'Nilkhet',
    description: 'Order books with delivery',
    icon: Store,
    href: '/nilkhet',
    color: 'bg-purple-500/10 text-purple-600',
  },
];

const HomePage = () => {
  return (
    <Layout>
      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Boi Rajjo
          </h1>
          <p className="text-muted-foreground">
            What would you like to explore today?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {categories.map((category) => (
            <Link key={category.title} to={category.href}>
              <Card className="h-full hover:shadow-card-hover transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`p-4 rounded-xl ${category.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
