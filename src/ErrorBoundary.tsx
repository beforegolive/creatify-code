import React from 'react'

interface IProps {
  // children?: React.ReactNode
  children?: any
}
interface IState {
  hasError: boolean
  err?: any
  errorInfo?: any
}

export class ErrorBoundary extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo)
    this.setState({
      err: error,
      errorInfo: errorInfo,
      hasError: true,
    })
  }

  render() {
    const { hasError, err, errorInfo } = this.state
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Error: {err?.message}</h1>
          <div>{errorInfo?.componentStack}</div>
          <hr />
          <div>stack: {err?.stack}</div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
