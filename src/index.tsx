import React from 'react'
import ReactDOM from 'react-dom'

import AppRouter from './routes'
import { ErrorBoundary } from './ErrorBoundary'
import reportWebVitals from './reportWebVitals'
import 'antd/dist/antd.min.css'
import './index.scss'

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this
    return target.replace(new RegExp(search, 'g'), replacement)
  }
}

// eslint-disable-next-line @typescript-eslint/no-extra-semi

ReactDOM.render(
  // <React.StrictMode>
  // @ts-ignore
  <ErrorBoundary>
    <AppRouter />
  </ErrorBoundary>,
  // <AppRouter />,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
