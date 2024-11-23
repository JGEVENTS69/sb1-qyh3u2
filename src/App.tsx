import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import Navigation from './components/Navigation';
import Map from './pages/Map';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import MyBoxes from './pages/MyBoxes';
import AddBox from './pages/AddBox';
import BoxDetails from './pages/BoxDetails';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch additional user data from your users table
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
            }
          });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data);
            }
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            
            {/* Routes protégées */}
            <Route path="/map" element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/my-boxes" element={
              <ProtectedRoute>
                <MyBoxes />
              </ProtectedRoute>
            } />
            <Route path="/add-box" element={
              <ProtectedRoute>
                <AddBox />
              </ProtectedRoute>
            } />
            <Route path="/box/:id" element={
              <ProtectedRoute>
                <BoxDetails />
              </ProtectedRoute>
            } />
            <Route path="/user/:username" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;