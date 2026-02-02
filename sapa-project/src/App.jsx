import { useEffect, useState } from "react";
import Home from "./components/Home";
import Profile from "./components/Profile";
import PostDetail from "./components/Detail";
import Vote from "./components/Vote";
import Navbar from "./components/Navbar";
import Parties from "./components/Parties";
import Header from "./components/Header";
import PartyHome from "./components/party/PartyHome.jsx";
import PartyCreatePosts from "./components/party/PartyCreatePosts.jsx";
import PartyPosts from "./components/party/PartyPosts.jsx";
import {Login,PartyLogin} from "./components/Login";
import Footer from "./components/Footer.jsx";
import { AuthProvider } from "./components/Context.jsx";
import { PARTIES } from "./data/parties";

import "./app.css";

// const API_URL =
//   "https://script.google.com/macros/s/AKfycbzogYPbBbKDyQ0EZhFSoJwFDLY2HnOZIZ3qvXGqNfqviqmP3AkATcL5yDd8Z1vDiaTZ/exec";

export default function App() {
  const [page, setPage] = useState("home");
  // const [posts, setPosts] = useState([]);
  const [forParty, setForParty] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [profileTab, setProfileTab] = useState("policies");
  const [sortBy, setSortBy] = useState("newest");
  const [isParty, setIsParty] = useState(false);

  // useEffect(() => {
  //   fetch(API_URL)
  //     .then((res) => res.json())
  //     .then((data) => setPosts(data.filter((p) => p?.id)))
  //     .catch(console.error);
  // }, []);

  // console.log("Hello World")

  function navigateTo(target, party = null) {
    window.scrollTo(0, 0);
    setPage(target);
    if (party) setSelectedParty(party);
  }

  function openPost(id, isParty = false) {
    setSelectedPostId(id);
    window.scrollTo(0, 0);
    if (isParty) setIsParty(true);
    setPage("post");
  }

  const renderPage = () => {
    if (page === "home")
    return (
      <Home
        // posts={posts}
        sortBy={sortBy}
        setSortBy={setSortBy}
        navigateTo={navigateTo}
        openPost={openPost}
      />
    );

    if (page === "profile" && selectedParty)
      return (
        <Profile
          party={selectedParty}
          // posts={posts}
          profileTab={profileTab}
          setProfileTab={setProfileTab}
          navigateTo={navigateTo}
          openPost={openPost}
        />
      );
    
    if (page === "parties") return <Parties 
        navigateTo={navigateTo}
        parties={PARTIES}
      />;

    if (page === "post") return <PostDetail navigateTo={navigateTo} postId={selectedPostId} isParty={isParty} />;
    
    if (page === "vote") return <Vote />;

    if (page === "login") return <Login navigateTo={navigateTo} forParty={forParty} />;

    if (page === "partyLogin") return <PartyLogin navigateTo={navigateTo} />;

    if (page === "partyHome") return <PartyHome party={selectedParty} PARTIES={PARTIES} navigateTo={navigateTo} setIsParty={setIsParty}/>;

    if (page === "partyCreatePosts") return <PartyCreatePosts party={selectedParty} PARTIES={PARTIES} navigateTo={navigateTo} />;

    if (page === "partyPosts") return <PartyPosts party={selectedParty} PARTIES={PARTIES} navigateTo={navigateTo} openPost={openPost} />;
  }
    
  
  return (
    <AuthProvider>
      <div>
        { page === 'partyHome' || page === 'partyLogin' || page === 'partyCreatePosts' || page === 'partyPosts' || (page === 'post' && isParty) ? (
          <div className="relative min-h-screen bg-[#f0f9ff]">
          {renderPage()}
          </div>
        ) : (
          <div>
            <Header navigateTo={navigateTo}/>
            <div className="relative min-h-screen bg-[#f0f9ff]">
              {renderPage()}
            </div>
            <Navbar page={page} navigateTo={navigateTo} />
            <Footer />
          </div>
        )}
      </div>
    </AuthProvider>
  );
}