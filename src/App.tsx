import '@radix-ui/themes/styles.css';
import { PermissionType } from 'arconnect';
import { ArweaveWalletKit } from 'arweave-wallet-kit';
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  createRoutesFromElements,
} from 'react-router-dom';

import Layout from './components/Layout/Layout';
import NotFound from './components/NotFound';
import {
  Address,
  BlockHeight,
  Contract,
  Documentation,
  Forum,
  Home,
  IDM,
  TokenLists,
  Transaction,
} from './components/pages';

const APP_PERMISSIONS: PermissionType[] = [
  'ACCESS_ADDRESS',
  'SIGN_TRANSACTION',
  'ENCRYPT',
  'DECRYPT',
  'ACCESS_ARWEAVE_CONFIG',
];

function App() {
  const router = createHashRouter(
    createRoutesFromElements(
      <Route element={<Layout />} errorElement={<NotFound />}>
        <Route path="/" element={<Home />} />
        <Route path="/address/:address" element={<Address />} />
        <Route path="/block/:blockHeight" element={<BlockHeight />} />
        <Route path="/contract/:address" element={<Contract />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/idm/:address" element={<IDM />} />
        <Route path="/tokens" element={<TokenLists />} />
        <Route path="/transaction/:transaction" element={<Transaction />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>,
    ),
  );

  return (
    <>
      <ArweaveWalletKit
        config={{
          permissions: APP_PERMISSIONS,
          ensurePermissions: true,
        }}
        theme={{
          displayTheme: 'dark',
          titleHighlight: { r: 100, b: 100, g: 30 },
          accent: { r: 100, b: 100, g: 30 },
          radius: 'minimal',
        }}
      >
        <RouterProvider router={router} />
      </ArweaveWalletKit>
    </>
  );
}

export default App;
