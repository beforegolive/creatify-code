import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
// import { Menu } from 'antd'

import PageLayout from './Layout'
// import MobileLayout from './LayoutMobile'
// import App from '../App'
import Entry from '../pages/index'
import Multi from '../pages/index-multi'
import Horizontal from '../pages/index-hori'
import Func from '../pages/index-func'

const AppRouter = () => {
  // const isMobile = window.navigator.userAgent.toLowerCase().includes('mobi')
  // const Layout = isMobile ? MobileLayout : PageLayout

  return (
    <HashRouter>
      <Routes>
        {/* @ts-ignore */}
        <Route element={<PageLayout />}>
          <Route index element={<Func />} />
          <Route path='/multi' element={<Multi />} />
          <Route path='/hori' element={<Horizontal />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default AppRouter
