import { Component, type ReactNode } from 'react';

export default class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main role="alert" className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl text-gray-900 mb-4">Страницата не можа да се покаже</h1>
          <p className="text-gray-600 mb-6">Възникна временен проблем. Опитай да я заредиш отново.</p>
          <button onClick={() => window.location.reload()} className="rounded-lg bg-gray-900 text-white px-5 py-3">Зареди отново</button>
          <a href="/" className="block mt-4 text-gray-700 underline">Към началото</a>
        </div>
      </main>
    );
  }
}
