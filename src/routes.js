import UserManagment from "views/UserManagment";
import Jobs from "views/Jobs";
import Template from "views/Template";

import FolderStructure from "views/FolderStructure";

import AdminJobQueue from "views/AdminJobQueue";
import AppManagement from "views/AppManagement";
import About from "views/About";
import Test2 from "views/test2";

var routes = [

  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Test2 />,
    layout: "/admin",
  },
  {
    path: "/jobs",
    name: "Job Management",
    icon: "ni ni-briefcase-24 text-yellow",
    component: <Jobs />,
    layout: "/admin",
  },

  {
    path: "/template",
    name: "Layout Management",
    icon: "ni ni-collection text-red",
    component: <Template />,
    layout: "/admin",
  },

  {
    path: "/user-managment",
    name: "User Managment",
    icon: "ni ni-circle-08 text-info",
    component: <UserManagment />,
    layout: "/admin",
  },

  {
    path: "/job-queue",
    name: "Admin Job Queue",
    icon: "ni ni-money-coins text-yellow",
    component: <AdminJobQueue />,
    layout: "/admin",
  },
  {
    path: "/server-folder",
    name: "Folder Management",
    icon: "ni ni-settings-gear-65 text-primary",
    component: <FolderStructure />,
    layout: "/admin",
  },

  {
    path: "/application-ip",
    name: "App Management",
    icon: "ni ni-bullet-list-67 text-red",
    component: <AppManagement />,
    layout: "/admin",
  },

  {
    path: "/user-profile",
    name: "About",
    icon: "ni ni-support-16 text-black",
    component: <About />,
    layout: "/admin",
  },
  
];
export default routes;
