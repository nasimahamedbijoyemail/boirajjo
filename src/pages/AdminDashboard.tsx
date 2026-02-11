import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  BookMarked, 
  Users, 
  Bell,
  Store,
  CreditCard,
  Send,
  UserX
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin, useAdminStats, useAdminNotifications } from '@/hooks/useAdmin';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminShopsTab from '@/components/admin/AdminShopsTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminDemandsTab from '@/components/admin/AdminDemandsTab';
import AdminPaymentsTab from '@/components/admin/AdminPaymentsTab';
import AdminBroadcastTab from '@/components/admin/AdminBroadcastTab';
import AdminDeletionRequestsTab from '@/components/admin/AdminDeletionRequestsTab';

const AdminDashboard = () => {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats } = useAdminStats();
  const { data: notifications = [] } = useAdminNotifications();

  // Safety cast to prevent deploy failure if types aren't updated yet
  const adminStats = stats as any;

  if (adminLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage orders, users, shops, and transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.pendingOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.pendingShopOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Shop Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.pendingDemands || 0}</p>
                  <p className="text-xs text-muted-foreground">Book Demands</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.pendingPayments || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.totalUsers || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Deletion Requests Stat Card */}
          <Card className={adminStats?.pendingDeletions > 0 ? "border-red-200 bg-red-50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserX className={`h-8 w-8 ${adminStats?.pendingDeletions > 0 ? "text-red-600 animate-pulse" : "text-gray-400"}`} />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.pendingDeletions || 0}</p>
                  <p className="text-xs text-muted-foreground">Delete Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-2xl font-bold">{adminStats?.totalShops || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="demands">Demands</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deletion-requests" className="text-red-600 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Requests
            </TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="broadcast">
              <Send className="h-4 w-4 mr-1" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <AdminOrdersTab />
          </TabsContent>

          <TabsContent value="demands">
            <AdminDemandsTab />
          </TabsContent>

          <TabsContent value="payments">
            <AdminPaymentsTab />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsersTab />
          </TabsContent>

          <TabsContent value="deletion-requests">
            <AdminDeletionRequestsTab />
          </TabsContent>

          <TabsContent value="shops">
            <AdminShopsTab />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No notifications yet
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="broadcast">
            <AdminBroadcastTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
