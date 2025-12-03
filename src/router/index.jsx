import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { getRouteConfig } from './route.utils';

// Lazy load components
const Root = lazy(() => import('@/layouts/Root'));
const Layout = lazy(() => import('@/components/organisms/Layout'));
const ContactManagement = lazy(() => import('@/components/pages/ContactManagement'));
const DealPipeline = lazy(() => import('@/components/pages/DealPipeline'));
const DealList = lazy(() => import('@/components/organisms/DealList'));
const CompanyManagement = lazy(() => import('@/components/pages/CompanyManagement'));
const TaskManagement = lazy(() => import('@/components/pages/TaskManagement'));
const LeadManagement = lazy(() => import('@/components/pages/LeadManagement'));
const NotFound = lazy(() => import('@/components/pages/NotFound'));
const Login = lazy(() => import('@/components/pages/Login'));
const Signup = lazy(() => import('@/components/pages/Signup'));
const Callback = lazy(() => import('@/components/pages/Callback'));
const ErrorPage = lazy(() => import('@/components/pages/ErrorPage'));
const ResetPassword = lazy(() => import('@/components/pages/ResetPassword'));
const PromptPassword = lazy(() => import('@/components/pages/PromptPassword'));
// createRoute Helper Function
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="nav-loading"></div>}><div className="page-transition">{element}</div></Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

// Main application routes
const appRoutes = [
  createRoute({
    index: true,
    element: <ContactManagement />
  }),
createRoute({
    path: "contacts",
    element: <ContactManagement />
  }),
createRoute({
path: "deals",
    element: <DealPipeline />
  }),
  createRoute({
    path: "deals/list",
    element: <DealList />
  }),
createRoute({
    path: "companies",
    element: <CompanyManagement />
  }),
createRoute({
    path: "tasks",
    element: <TaskManagement />
  }),
  createRoute({
    path: "leads",
    element: <LeadManagement />
  }),
  createRoute({
    path: "*",
    element: <NotFound />
  })
];

// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // Authentication routes
      createRoute({
        path: "login",
        element: <Login />
      }),
      createRoute({
        path: "signup", 
        element: <Signup />
      }),
      createRoute({
        path: "callback",
        element: <Callback />
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      
      // Main app layout with nested routes
      {
        path: "/",
        element: <Layout />,
        children: appRoutes
      }
    ]
  }
]);