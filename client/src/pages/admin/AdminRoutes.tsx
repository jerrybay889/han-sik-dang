import { lazy, Suspense } from "react";
import { Route, Switch, Router } from "wouter";
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
        <Router base="/admin">
          <Switch>
            <Route path="/" component={AdminDashboard} />
          
          {/* Restaurants */}
          <Route path="/restaurants/applications" component={AdminRestaurantApplications} />
          <Route path="/restaurants/owner-inquiries" component={AdminOwnerInquiries} />
          <Route path="/restaurants/payments" component={AdminPayments} />
          <Route path="/restaurants/owner-notices" component={AdminOwnerNotices} />
          <Route path="/restaurants" component={AdminRestaurants} />
          
          {/* Users */}
          <Route path="/users/tiers" component={AdminUsersByTier} />
          <Route path="/users/analytics" component={AdminUsersAnalytics} />
          <Route path="/users" component={AdminUsers} />
          
          {/* Reviews */}
          <Route path="/reviews" component={AdminReviews} />
          
          {/* Content */}
          <Route path="/content/youtube" component={AdminYouTube} />
          <Route path="/content/blog" component={AdminBlog} />
          <Route path="/content/events" component={AdminEvents} />
          <Route path="/content/announcements" component={AdminAnnouncements} />
          <Route path="/content" component={AdminContent} />
          
          {/* Inquiries */}
          <Route path="/inquiries/customer" component={AdminCustomerInquiries} />
          <Route path="/inquiries/partnership" component={AdminPartnershipInquiries} />
          </Switch>
        </Router>
      </Suspense>
    </AdminLayout>
  );
}
