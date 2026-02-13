import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import FactorMonitor from '@/pages/FactorMonitor';
import FactorDetail from '@/pages/FactorDetail';
import FactorRegister from '@/pages/FactorRegister';
import NotificationCenter from '@/pages/NotificationCenter';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            rowHoverBg: '#f0f5ff',
          },
          Card: {
            paddingLG: 20,
          },
        },
      }}
    >
      <AntdApp>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/factors" element={<FactorMonitor />} />
              <Route path="/factors/:id" element={<FactorDetail />} />
              <Route path="/register" element={<FactorRegister />} />
              <Route path="/notifications" element={<NotificationCenter />} />
            </Route>
          </Routes>
        </HashRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
