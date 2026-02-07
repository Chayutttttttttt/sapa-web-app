import { Suspense, lazy } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./components/Context.jsx";
import { PARTIES } from "./data/parties";
import "./app.css";

const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const PostDetail = lazy(() => import("./components/Detail"));
const Vote = lazy(() => import("./components/Vote"));
const Parties = lazy(() => import("./components/Parties"));
const Navbar = lazy(() => import("./components/Navbar"));
const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer.jsx"));

const PartyHome = lazy(() => import("./components/party/PartyHome.jsx"));
const PartyCreatePosts = lazy(() => import("./components/party/PartyCreatePosts.jsx"));
const PartyPosts = lazy(() => import("./components/party/PartyPosts.jsx"));
const PartyDetail = lazy(() => import("./components/party/PartyDetail.jsx"))
const Login = lazy(() => import("./components/Login").then(module => ({ default: module.Login })));
const PartyLogin = lazy(() => import("./components/Login").then(module => ({ default: module.PartyLogin })));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  window.scroll(0,0)

  const isHideLayout = 
    location.pathname.startsWith("/partyAdmin") || 
    location.pathname === "/partyLogin";

  return (
    <AuthProvider>
      {!isHideLayout && <Header navigateTo={(path) => navigate(path)} />}
      <div className="relative min-h-screen bg-[#f0f9ff]">
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home navigateTo={(path) => navigate(path)} />} />
            <Route path="/parties" element={<Parties parties={PARTIES} navigateTo={(path) => navigate(path)} />} />
            <Route path="/profile/:id" element={<Profile navigateTo={(path) => navigate(path)} />} />
            <Route path="/party/:partyId/post/:postId" element={<PostDetail navigateTo={(path) => navigate(path)} />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/login" element={<Login navigateTo={(path) => navigate(path)} />} />
            <Route path="/partyLogin" element={<PartyLogin navigateTo={(path) => navigate(path)} />} />
            <Route path="/partyAdmin/:id" element={<PartyHome navigateTo={(path) => navigate(path)} />} />
            <Route path="/partyAdmin/:id/create" element={<PartyCreatePosts PARTIES={PARTIES} navigateTo={(path) => navigate(path)} />} />
            <Route path="/partyAdmin/:id/posts" element={<PartyPosts PARTIES={PARTIES} navigateTo={(path) => navigate(path)} />} />
            <Route path="/partyAdmin/:id/posts/:postID" element={<PartyDetail PARTIES={PARTIES} navigateTo={(path) => navigate(path)}/>}></Route>
          </Routes>
        </Suspense>
      </div>

      {!isHideLayout && (
        <>
          <Navbar navigateTo={(path) => navigate(path)} />
          <Footer />
        </>
      )}
    </AuthProvider>
  );
}