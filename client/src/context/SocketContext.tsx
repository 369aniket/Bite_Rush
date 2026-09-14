import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppData } from './AppContext';
import { realtimeService } from '../main';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ 
    socket: null, 
    isConnected: false 
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { isAuth } = useAppData();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!isAuth) {
            setSocket(prev => {
                prev?.disconnect();
                return null;
            });
            setIsConnected(false);
            return;
        }

        const newSocket = io(realtimeService, {
            auth: {
                token: localStorage.getItem('token')
            },
            transports: ['websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket Disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket Error:', err.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuth]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);