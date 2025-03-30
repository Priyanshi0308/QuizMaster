// import Navbar from "../components/Navbar.js";
import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import Signup from "../pages/Signup.js";
import Logout from "../pages/Logout.js";
import DashboardStud from "../pages/DashboardStud.js";
import DashboardAdmin from "../pages/DashboardAdmin.js";
import Profile from "../pages/Profile.js";
import store from "./store.js";
import StudentSummary from "../pages/StudentSummary.js";
import AdminSummary from "../pages/AdminSummary.js";

const routes = [
  { path: "/", component: Home },
  { path: "/user-login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/logout", component: Logout },
  {
    path: "/stud-dashboard",
    component: DashboardStud,
    meta: { requiresLogin: true, role: "stud" },
  },
  {
    path: "/stud-summary",
    component: StudentSummary,
    meta: { requiresLogin: true, role: "stud" },
  },
  {
    path: "/admin-dashboard",
    component: DashboardAdmin,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/admin-summary",
    component: AdminSummary,
    meta: { requiresLogin: true, role: "admin" },
  },
  { path: "/profile", component: Profile, meta: { loggedIn: true } },
];

const router = new VueRouter({
  routes,
});

// frontend router protection
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!store.state.loggedIn) {
      next({ path: "/user-login" });
    } else if (to.meta.role && to.meta.role !== store.state.role) {
      next({ path: "/" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;