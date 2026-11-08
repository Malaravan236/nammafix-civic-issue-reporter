import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 40, maxWidth: 560, margin: '60px auto', fontFamily: 'sans-serif' }}>
        <h2>Something went wrong on this page</h2>
        <p style={{ color: '#666' }}>{String(this.state.error.message || this.state.error)}</p>
        <button onClick={() => { this.setState({ error: null }); window.location.href = '/' }} style={{ padding: '10px 18px', cursor: 'pointer' }}>Go to Home</button>
      </div>
    )
  }
}