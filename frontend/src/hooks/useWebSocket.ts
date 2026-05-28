'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAssignmentStore } from '@/store/assignmentStore';
import { getPaper } from '@/lib/api';

let socket: Socket | null = null;

export function useWebSocket(assignmentId: string | null) {
  const router = useRouter();
  const { setJobStatus, setStatusMessage, setCurrentStep, setPaper } = useAssignmentStore();
  const navigatedRef = useRef(false);

  useEffect(() => {
    if (!assignmentId) return;
    navigatedRef.current = false;

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    socket = io(url, { transports: ['websocket'] });

    socket.on('connect', () => {
      socket!.emit('join', assignmentId);
    });

    socket.on('job:update', async (data: {
      status: string;
      message: string;
      step?: number;
      totalSteps?: number;
      paperId?: string;
      error?: string;
    }) => {
      setStatusMessage(data.message);
      if (data.step) setCurrentStep(data.step);

      if (data.status === 'completed') {
        setCurrentStep(6);
        setJobStatus('completed');
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          try {
            const paper = await getPaper(assignmentId);
            setPaper(paper);
          } catch {}
          setTimeout(() => router.push(`/output/${assignmentId}`), 600);
        }
      } else if (data.status === 'failed') {
        setJobStatus('failed');
        toast.error(data.message || 'Generation failed');
      } else {
        setJobStatus('processing');
      }
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [assignmentId]); // eslint-disable-line
}
