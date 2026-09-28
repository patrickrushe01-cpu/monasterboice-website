import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import News from './pages/News.jsx'
import Bulletins from './pages/Bulletins.jsx'
import Sacraments from './pages/Sacraments.jsx'
import Contact from './pages/Contact.jsx'
import Admin from './pages/Admin.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import SupportUs from './pages/SupportUs.jsx'
import Webcam from './pages/Webcam.jsx'
import NotFound from './pages/NotFound.jsx'
import { ContentProvider, EditBar } from './lib/content.jsx'

export default function App() {
  return (
    <ContentProvider>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/news" element={<News />} />
      <Route path="/bulletins" element={<Bulletins />} />
      <Route path="/sacraments" element={<Sacraments />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/support" element={<SupportUs />} />
      <Route path="/webcam" element={<Webcam />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/reset" element={<ResetPassword />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <EditBar />
    </ContentProvider>
  )
}
