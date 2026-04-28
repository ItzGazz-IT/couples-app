import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message || String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "32px 20px",
          fontFamily: "sans-serif",
          maxWidth: 480,
          margin: "0 auto",
        }}>
          <h2 style={{ color: "#cc5428" }}>Something went wrong</h2>
          <p style={{ color: "#6b7283", fontSize: "0.9rem" }}>{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              marginTop: 12,
              padding: "10px 18px",
              border: 0,
              borderRadius: 12,
              background: "#ef7a3e",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
