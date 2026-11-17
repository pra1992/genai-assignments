export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <span>CodeLens AI</span>
        <span>Intelligent Java Code Review</span>
        <span>© {new Date().getFullYear()} CodeLens AI</span>
      </div>
    </footer>
  );
}
