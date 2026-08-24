// pages/statics.tsx
import dynamic from 'next/dynamic';

const DashboardRootWithNoSSR = dynamic(
  () => import('../src/components/DashboardRoot'),
  { 
    ssr: false,
    loading: () => {
      // Прямо в момент рендеринга функции генерируем уникальный ID для изоляции стиля
      const styleId = "theme-loader-injector";
      
      return (
        <div className="instant-loader-container">
          {/* 🌟 МГНОВЕННЫЙ ИНЖЕКТОР СТИЛЕЙ ДО СТАРТА РЕНДЕРА ТЕКСТА */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var saved = localStorage.getItem('dashboard-theme-setting');
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  
                  // Создаем атомарный стиль и внедряем его в HEAD
                  var existingStyle = document.getElementById('${styleId}');
                  if (!existingStyle) {
                    var style = document.createElement('style');
                    style.id = '${styleId}';
                    style.innerHTML = isDark 
                      ? '.instant-loader-container { background-color: #0f172a !important; --accent: #00f2fe; --text: rgba(0,242,254,0.3); --text-flash: rgba(255,255,255,0.9); --bar-bg: rgba(255,255,255,0.03); --bar-border: rgba(0,242,254,0.15); --glow: #00f2fe; }'
                      : '.instant-loader-container { background-color: #f8fafc !important; --accent: #4facfe; --text: rgba(79,172,254,0.4); --text-flash: rgba(15,23,42,0.9); --bar-bg: rgba(0,0,0,0.02); --bar-border: rgba(79,172,254,0.2); --glow: rgba(79, 172, 254, 0.5); }';
                    document.head.appendChild(style);
                  }
                  document.documentElement.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                })();
              `
            }}
          />

          <div className="instant-logo">
            ОПРАШИВАЮ НОДЫ...
          </div>

          <div className="instant-bar">
            <div className="instant-progress" />
          </div>

          <style global jsx>{`
            html, body, #__next {
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              width: 100% !important;
              height: 100% !important;
            }

            .instant-loader-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 99999;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 16px;
              /* Дефолтный цвет на случай сбоя скрипта — темный */
              background-color: #0f172a; 
            }

            .instant-logo {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 3px;
              color: var(--text, rgba(0, 242, 254, 0.3));
              background: linear-gradient(90deg, var(--text, rgba(0,242,254,0.3)) 0%, var(--text-flash, #fff) 50%, var(--text, rgba(0,242,254,0.3)) 100%);
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: textShimmer 1.5s infinite linear;
            }

            .instant-bar {
              width: 140px;
              height: 12px;
              background: var(--bar-bg, rgba(255, 255, 255, 0.03));
              border: 1px solid var(--bar-border, rgba(0, 242, 254, 0.15));
              border-radius: 4px;
              padding: 2px;
              overflow: hidden;
            }

            .instant-progress {
              height: 100%;
              width: 40%;
              background: var(--accent, #00f2fe);
              box-shadow: 0 0 8px var(--glow, #00f2fe);
              border-radius: 2px;
              animation: barMove 1.2s infinite ease-in-out;
            }

            @keyframes textShimmer {
              0% { background-position: 200% center; }
              100% { background-position: -200% center; }
            }

            @keyframes barMove {
              0% { transform: translate3d(-100%, 0, 0); }
              50% { transform: translate3d(250%, 0, 0); }
              100% { transform: translate3d(-100%, 0, 0); }
            }
          `}</style>
        </div>
      );
    }
  }
);

export default function DashboardPage() {
  return <DashboardRootWithNoSSR />;
}
