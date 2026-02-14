
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Header from './components/Header'
import Footer from './components/Footer'
import Upload from './pages/Upload'
import WellDetails from './pages/WellDetails'
import Interpretation from './pages/Interpretation'
import Visualize from './pages/Visualize'

function App() {

  return (  
    <div>
      <Header />
      <Routes>
        <Route path='/' element = {<Home />}/>
        <Route path='/upload' element = {<Upload />}/>
        <Route path='/well/:id' element = {<WellDetails />}/>
        <Route path='/interpretation/:id' element = {<Interpretation />}/>
        <Route path='/visualize/:id' element = {<Visualize />}/>
      </Routes>
      <Footer />
    </div>
  )
}

export default App
