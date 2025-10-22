import { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import AdminLayout from "./AdminLayout";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminRestaurants = lazy(() => import("./AdminRestaurants"));
const AdminUsers = lazy(() => import("./AdminUsers"));
const AdminReviews = lazy(() => import("./AdminReviews"));
const AdminContent = lazy(() => import("./AdminContent"));

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
          <Route path="/admin/restaurants" component={AdminRestaurants} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/reviews" component={AdminReviews} />
          <Route path="/admin/content" component={AdminContent} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
}
