import React from 'react';

/**
 * Error boundary for 3D chapter components.
 *
 * If a chapter's WebGL scene throws during React's render or commit phase
 * (context loss, null reference, shader compile error), this catches the
 * error and renders the chapter's static fallback instead of crashing the
 * entire page.
 */
export class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[landing] Scene error caught by boundary:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
