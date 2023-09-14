import { Button } from '@radix-ui/themes';
import { useApi, useConnection } from 'arweave-wallet-kit';

import { useGlobalState } from '../../services/state/contexts/GlobalState';

function Connect() {
  const [{ walletAddress }, dispatchGlobalState] = useGlobalState();
  const { connected, connect, disconnect } = useConnection();
  const api = useApi();

  async function handleConnect() {
    try {
      await connect().catch((err) => {
        console.error(err, 'Error connecting');
      });
      const address = await api?.getActiveAddress();

      if (!address) {
        throw new Error('No address found');
      }
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: address,
      });
    } catch (error) {
      console.error(error, 'Error getting address');
    }
  }

  async function handleDisconnect() {
    await disconnect();
    dispatchGlobalState({
      type: 'setWalletAddress',
      payload: undefined,
    });
  }

  return (
    <Button
      variant={walletAddress ? 'outline' : 'solid'}
      onClick={() => (!walletAddress ? handleConnect() : handleDisconnect())}
    >
      {walletAddress ? walletAddress.slice(0, 5) + '...' : 'Connect'}
    </Button>
  );
}

export default Connect;
