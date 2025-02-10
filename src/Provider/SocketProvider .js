import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../Components/hooks';
import {disconnectSocket, initializeSocket} from '../api/SocketManager';
import {
  setConnected,
  setDisconnected,
  setError,
} from '../api/store/slice/socketSlice';

const SocketInitializer = () => {
  const dispatch = useAppDispatch();
  const domainState = useAppSelector(
    state => state.domains.selectedDomain?.domain,
  );
  const token = useAppSelector(state => state.auth.user?.authToken);

  useEffect(() => {
    if (domainState && token) {
      try {
        initializeSocket({domainState, token});
        dispatch(setConnected());
      } catch (error) {
        dispatch(setError(error.message));
      }
    } else {
      disconnectSocket();
      dispatch(setDisconnected());
    }
  }, [domainState, token, dispatch]);

  return null;
};

export default SocketInitializer;
