// pages/dashboard.tsx
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';

const DashboardRootWithNoSSR = dynamic(
  () => import('../src/components/DashboardRoot'),
  { 
    ssr: false,
    // Мгновенная заглушка с CSS-анимацией для исключения пустой темноты
    loading: () => (
      <Box 
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: '#0f172a',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}
      >
        {/* 🌟 МГНОВЕННЫЙ НЕОНОВЫЙ ТЕКСТ С SHIMMER-БЛИКОМ */}
        <div className="instant-logo">
          ОПРАШИВАЮ НОДЫ...
        </div>

        {/* Микро-линия загрузки под текстом */}
        <div className="instant-bar">
          <div className="instant-progress" />
        </div>

        <style global jsx>{`
          html, body, #__next {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0f172a !important;
            overflow: hidden !important;
            width: 100% !important;
            height: 100% !important;
          }

          .instant-logo {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 3px;
            color: rgba(0, 242, 254, 0.3);
            /* Эффект бегущего блика */
            background: linear-gradient(90deg, rgba(0,242,254,0.3) 0%, rgba(255,255,255,0.9) 50%, rgba(0,242,254,0.3) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: textShimmer 1.5s infinite linear;
          }

          .instant-bar {
            width: 140px;
            height: 20px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(0, 242, 254, 0.15);
            border-radius: 4px;
            padding: 2px;
            overflow: hidden;
          }

          .instant-progress {
            height: 100%;
            width: 40%;
            background: #00f2fe;
            box-shadow: 0 0 8px #00f2fe;
            border-radius: 2px;
            animation: barMove 1.2s infinite ease-in-out;
          }

          @keyframes textShimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          @keyframes barMove {
            0% { transform: translate3d(-100%, 0, 0); }
            50% { transform: translate3d(250%, 0, 0); }
            100% { transform: translate3d(-100%, 0, 0); }
          }
        `}</style>
      </Box>
    )
  }
);

export default function DashboardPage() {
  return <DashboardRootWithNoSSR />;
}
