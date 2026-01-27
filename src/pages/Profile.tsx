import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, Building2, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution } from '@/types/database';

const ProfilePage = () => {
  const { profile } = useAuth();

  const { data: institution } = useQuery({
    queryKey: ['institution', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('id', profile.institution_id)
        .single();
      if (error) throw error;
      return data as Institution;
    },
    enabled: !!profile?.institution_id,
  });

  const institutionTypeLabels = {
    university: 'University',
    college: 'College',
    school: 'School',
  };

  return (
    <Layout>
      <div className="container py-6 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">My Profile</h1>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{profile?.name}</CardTitle>
                <Badge variant="institution" className="mt-1">
                  {institution?.name || 'No institution selected'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{profile?.phone_number}</p>
                </div>
              </div>

              {institution && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institution Type</p>
                    <p className="font-medium">
                      {profile?.institution_type
                        ? institutionTypeLabels[profile.institution_type]
                        : '-'}
                    </p>
                  </div>
                </div>
              )}

              {profile?.subcategory && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {profile.institution_type === 'university'
                        ? 'Department'
                        : profile.institution_type === 'college'
                        ? 'Division'
                        : 'Class'}
                    </p>
                    <p className="font-medium">{profile.subcategory}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;
