import React, { useState } from 'react'
import { Layout, Breadcrumb } from 'antd'
import { Outlet, Link, useLocation } from 'react-router-dom'

// import { CommonNavigationMenu, breadcrumbItemsMap } from './index'

const { Content, Sider } = Layout

const PageLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible={false} trigger={null}>
        <div className='logo' />
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
