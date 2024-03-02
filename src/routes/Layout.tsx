import React, { useState } from 'react'
import { Layout, Breadcrumb } from 'antd'
import { Outlet, Link, useLocation } from 'react-router-dom'
import Img1 from '../assets/img1.png'
import Img2 from '../assets/img2.png'
import Img3 from '../assets/img3.png'

// import { CommonNavigationMenu, breadcrumbItemsMap } from './index'

const { Content, Sider } = Layout

const PageLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible={false} trigger={null}>
        <div className='logo' />
        <div className='imgPanel'>
          <img src={Img1} />
          <img src={Img2} />
          <img src={Img3} />
        </div>
      </Sider>
      <Layout className='site-layout'>
        <Content style={{ margin: '0 16px' }}>
          <div className='site-layout-background' style={{ padding: 24, minHeight: 360 }}>
            {/* {this.props.children} */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default PageLayout
