import React from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Entry from '../pages/index'

const AppRouter = () => {
  return (
    <HashRouter>
      <Routes>
        {/* @ts-ignore */}
        {/* <Route element={<PageLayout />}> */}
        <Route index element={<Entry />} />
        {/* </Route> */}
      </Routes>
    </HashRouter>
  )
}

export default AppRouter
