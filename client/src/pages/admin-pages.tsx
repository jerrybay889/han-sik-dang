import { lazy, Suspense } from "react";
import AdminLayout from "./admin/AdminLayout";

const AdminDashboardPage = lazy(() => import("./admin/AdminDashboard"));
const AdminRestaurantsPage = lazy(() => import("./admin/AdminRestaurants"));
const AdminRestaurantApplicationsPage = lazy(() => import("./admin/AdminRestaurantApplications"));
const AdminOwnerInquiriesPage = lazy(() => import("./admin/AdminOwnerInquiries"));
const AdminPaymentsPage = lazy(() => import("./admin/AdminPayments"));
const AdminOwnerNoticesPage = lazy(() => import("./admin/AdminOwnerNotices"));
const AdminUsersPage = lazy(() => import("./admin/AdminUsers"));
const AdminUsersByTierPage = lazy(() => import("./admin/AdminUsersByTier"));
const AdminUsersAnalyticsPage = lazy(() => import("./admin/AdminUsersAnalytics"));
const AdminReviewsPage = lazy(() => import("./admin/AdminReviews"));
const AdminContentPage = lazy(() => import("./admin/AdminContent"));
const AdminYouTubePage = lazy(() => import("./admin/AdminYouTube"));
const AdminBlogPage = lazy(() => import("./admin/AdminBlog"));
const AdminEventsPage = lazy(() => import("./admin/AdminEvents"));
const AdminAnnouncementsPage = lazy(() => import("./admin/AdminAnnouncements"));
const AdminCustomerInquiriesPage = lazy(() => import("./admin/AdminCustomerInquiries"));
const AdminPartnershipInquiriesPage = lazy(() => import("./admin/AdminPartnershipInquiries"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function withLayout(Page: React.ComponentType) {
  return function WrappedPage() {
    return (
      <AdminLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Page />
        </Suspense>
      </AdminLayout>
    );
  };
}

export const AdminDashboard = withLayout(AdminDashboardPage);
export const AdminRestaurants = withLayout(AdminRestaurantsPage);
export const AdminRestaurantApplications = withLayout(AdminRestaurantApplicationsPage);
export const AdminOwnerInquiries = withLayout(AdminOwnerInquiriesPage);
export const AdminPayments = withLayout(AdminPaymentsPage);
export const AdminOwnerNotices = withLayout(AdminOwnerNoticesPage);
export const AdminUsers = withLayout(AdminUsersPage);
export const AdminUsersByTier = withLayout(AdminUsersByTierPage);
export const AdminUsersAnalytics = withLayout(AdminUsersAnalyticsPage);
export const AdminReviews = withLayout(AdminReviewsPage);
export const AdminContent = withLayout(AdminContentPage);
export const AdminYouTube = withLayout(AdminYouTubePage);
export const AdminBlog = withLayout(AdminBlogPage);
export const AdminEvents = withLayout(AdminEventsPage);
export const AdminAnnouncements = withLayout(AdminAnnouncementsPage);
export const AdminCustomerInquiries = withLayout(AdminCustomerInquiriesPage);
export const AdminPartnershipInquiries = withLayout(AdminPartnershipInquiriesPage);
