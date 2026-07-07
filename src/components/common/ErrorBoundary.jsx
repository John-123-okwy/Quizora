import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.75rem 0 1.5rem' }}>
            An unexpected error occurred. Try reloading the page.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.7rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}