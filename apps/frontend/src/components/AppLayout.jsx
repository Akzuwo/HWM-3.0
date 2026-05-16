import { Header } from './Header';
import { Footer } from './Footer';

export function AppLayout({ children, footer = true, mainClassName = '', shellClassName = '' }) {
  return (
    <div className={`hm-react-shell ${shellClassName}`.trim()}>
      <div className="hm-app-backdrop" aria-hidden="true">
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--violet"></div>
        <div className="hm-app-backdrop__orb hm-app-backdrop__orb--cyan"></div>
        <div className="hm-app-backdrop__grid"></div>
      </div>
      <Header />
      <div id="pageContent">
        <div className={`hm-react-main ${mainClassName}`.trim()}>
          <div className="hm-react-main__inner">{children}</div>
        </div>
        {footer ? <Footer /> : null}
      </div>
    </div>
  );
}
