import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import AdminLayout from "./AdminLayout";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminRestaurants = lazy(() => import("./AdminRestaurants"));
const AdminUsers = lazy(() => import("./AdminUsers"));
const AdminUsersByTier = lazy(() => import("./AdminUsersByTier"));
const AdminUsersAnalytics = lazy(() => import("./AdminUsersAnalytics"));
const AdminReviews = lazy(() => import("./AdminReviews"));
const AdminContent = lazy(() => import("./AdminContent"));
const AdminRestaurantApplications = lazy(() => import("./AdminRestaurantApplications"));
const AdminOwnerInquiries = lazy(() => import("./AdminOwnerInquiries"));
const AdminPayments = lazy(() => import("./AdminPayments"));
const AdminOwnerNotices = lazy(() => import("./AdminOwnerNotices"));
const AdminYouTube = lazy(() => import("./AdminYouTube"));
const AdminBlog = lazy(() => import("./AdminBlog"));
const AdminEvents = lazy(() => import("./AdminEvents"));
const AdminAnnouncements = lazy(() => import("./AdminAnnouncements"));
const AdminCustomerInquiries = lazy(() => import("./AdminCustomerInquiries"));
const AdminPartnershipInquiries = lazy(() => import("./AdminPartnershipInquiries"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AdminRoutes() {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          
          {/* Restaurants */}
          <Route path="/admin/restaurants/applications" component={AdminRestaurantApplications} />
          <Route path="/admin/restaurants/owner-inquiries" component={AdminOwnerInquiries} />
          <Route path="/admin/restaurants/payments" component={AdminPayments} />
          <Route path="/admin/restaurants/owner-notices" component={AdminOwnerNotices} />
          <Route path="/admin/restaurants" component={AdminRestaurants} />
          
          {/* Users */}
          <Route path="/admin/users/tiers" component={AdminUsersByTier} />
          <Route path="/admin/users/analytics" component={AdminUsersAnalytics} />
          <Route path="/admin/users" component={AdminUsers} />
          
          {/* Reviews */}
          <Route path="/admin/reviews" component={AdminReviews} />
          
          {/* Content */}
          <Route path="/admin/content/youtube" component={AdminYouTube} />
          <Route path="/admin/content/blog" component={AdminBlog} />
          <Route path="/admin/content/events" component={AdminEvents} />
          <Route path="/admin/content/announcements" component={AdminAnnouncements} />
          <Route path="/admin/content" component={AdminContent} />
          
          {/* Inquiries */}
          <Route path="/admin/inquiries/customer" component={AdminCustomerInquiries} />
          <Route path="/admin/inquiries/partnership" component={AdminPartnershipInquiries} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
}
