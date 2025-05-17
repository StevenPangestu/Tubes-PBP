import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import PrivateRoute from './components/privateRoute';
import CreateCollection from './pages/createCollection';
import Comments from './pages/createComment';
import CreatePost from './pages/createPost';
import Home from './pages/home';
import Login from './pages/login';
import Profile from './pages/profile';
import Register from './pages/register';
import SavePost from './pages/save';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Add new routes for collections */}
        <Route path="/collections/create" element={
          <PrivateRoute>
            <CreateCollection />
          </PrivateRoute>
        } />

        <Route path="/collections/save/:postId" element={
          <PrivateRoute>
            <SavePost />
          </PrivateRoute>
        } />

        {/* Add new routes for comments */}
        <Route path="/posts/:idPost/comments" element={
          <PrivateRoute>
            <Comments />
          </PrivateRoute>
        } />


        

        <Route path="/create" element={
          <PrivateRoute>
            <CreatePost />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/users/:username" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
