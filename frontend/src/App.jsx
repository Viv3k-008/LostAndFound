import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostLostItem from './pages/PostLostItem';
import PostFoundItem from './pages/PostFoundItem';
import BrowseFoundItems from './pages/BrowseFoundItems';
import FoundItemDetail from './pages/FoundItemDetail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/post-lost" element={<PostLostItem />} />
        <Route path="/post-found" element={<PostFoundItem />} />
        <Route path="/browse" element={<BrowseFoundItems />} />
        <Route path="/found/:id" element={<FoundItemDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;