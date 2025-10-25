import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
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
  const [location] = useLocation();
  
  let PageComponent = AdminDashboard;
  
  // Match specific routes first (more specific to less specific)
  if (location === "/admin/restaurants/applications") {
    PageComponent = AdminRestaurantApplications;
  } else if (location === "/admin/restaurants/owner-inquiries") {
    PageComponent = AdminOwnerInquiries;
  } else if (location === "/admin/restaurants/payments") {
    PageComponent = AdminPayments;
  } else if (location === "/admin/restaurants/owner-notices") {
    PageComponent = AdminOwnerNotices;
  } else if (location === "/admin/restaurants") {
    PageComponent = AdminRestaurants;
  } else if (location === "/admin/users/tiers") {
    PageComponent = AdminUsersByTier;
  } else if (location === "/admin/users/analytics") {
    PageComponent = AdminUsersAnalytics;
  } else if (location === "/admin/users") {
    PageComponent = AdminUsers;
  } else if (location === "/admin/reviews") {
    PageComponent = AdminReviews;
  } else if (location === "/admin/content/youtube") {
    PageComponent = AdminYouTube;
  } else if (location === "/admin/content/blog") {
    PageComponent = AdminBlog;
  } else if (location === "/admin/content/events") {
    PageComponent = AdminEvents;
  } else if (location === "/admin/content/announcements") {
    PageComponent = AdminAnnouncements;
  } else if (location === "/admin/content") {
    PageComponent = AdminContent;
  } else if (location === "/admin/inquiries/customer") {
    PageComponent = AdminCustomerInquiries;
  } else if (location === "/admin/inquiries/partnership") {
    PageComponent = AdminPartnershipInquiries;
  }
  
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingFallback />}>
        <PageComponent />
      </Suspense>
    </AdminLayout>
  );
}
