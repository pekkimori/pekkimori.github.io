import { Component, type ReactNode } from "react";

type Props = {
  lang: "en" | "pt";
  children: ReactNode;
};

// A rejected lazy import must not unmount the entire terminal desktop.
export default class PanelErrorBoundary extends Component<
  Props,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const pt = this.props.lang === "pt";
    return (
      <div role="alert">
        <p>
          {pt
            ? "Não foi possível carregar este conteúdo. Recarregue a página para tentar novamente."
            : "This content could not load. Reload the page to try again."}
        </p>
        <button
          type="button"
          className="retro-button"
          onClick={() => window.location.reload()}
        >
          {pt ? "Recarregar página" : "Reload page"}
        </button>
      </div>
    );
  }
}
