import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <p className="text-accent text-lg font-semibold mb-2">Algo salió mal</p>
            <p className="text-muted text-sm mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-black font-semibold px-6 py-2.5 rounded-xl"
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
