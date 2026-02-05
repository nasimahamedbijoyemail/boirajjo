 import { Layout } from '@/components/layout/Layout';
 import { Card, CardContent } from '@/components/ui/card';
 import { useMyShopOrders } from '@/hooks/useShops';
 import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
 import { Package, Store } from 'lucide-react';
 
 const MyOrdersPage = () => {
   const { data: shopOrders = [], isLoading } = useMyShopOrders();
 
   return (
     <Layout>
       <div className="container py-6 max-w-3xl">
         <div className="mb-6">
           <h1 className="text-2xl md:text-3xl font-bold text-foreground">
             Nilkhet Orders
           </h1>
           <p className="text-muted-foreground">
             Track your Nilkhet book orders
           </p>
         </div>
 
         {isLoading ? (
           <div className="space-y-3">
             {[...Array(3)].map((_, i) => (
               <Card key={i} className="animate-pulse">
                 <CardContent className="p-4">
                   <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                   <div className="h-4 bg-muted rounded w-1/3" />
                 </CardContent>
               </Card>
             ))}
           </div>
         ) : shopOrders.length === 0 ? (
           <Card>
             <CardContent className="p-8 text-center">
               <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <p className="text-muted-foreground">No Nilkhet orders yet</p>
             </CardContent>
           </Card>
         ) : (
           <div className="space-y-4">
             {shopOrders.map((order) => (
               <Card key={order.id}>
                 <CardContent className="p-4 space-y-4">
                   <div className="flex items-start gap-4">
                     <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                       {order.shop_book?.photo_url ? (
                         <img
                           src={order.shop_book.photo_url}
                           alt={order.shop_book.title}
                           className="h-full w-full object-cover"
                         />
                       ) : (
                         <div className="flex h-full w-full items-center justify-center">
                           <Package className="h-6 w-6 text-muted-foreground/50" />
                         </div>
                       )}
                     </div>
                     <div className="flex-1">
                       <p className="text-xs font-mono text-muted-foreground mb-1">
                         {order.order_number || `SHP-${order.id.slice(0, 8).toUpperCase()}`}
                       </p>
                       <h3 className="font-semibold text-foreground">
                         {order.shop_book?.title || 'Unknown Book'}
                       </h3>
                       <p className="text-sm text-muted-foreground">
                         ৳{order.total_price.toLocaleString()} × {order.quantity || 1}
                       </p>
                       {order.shop && (
                         <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                           <Store className="h-3 w-3" />
                           {order.shop.name}
                         </p>
                       )}
                       <p className="text-xs text-muted-foreground mt-1">
                         Ordered on {new Date(order.created_at).toLocaleDateString()}
                       </p>
                     </div>
                   </div>
                   
                   <div className="pt-2">
                     <OrderStatusTracker status={order.status} type="order" />
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </div>
     </Layout>
   );
 };
 
 export default MyOrdersPage;
