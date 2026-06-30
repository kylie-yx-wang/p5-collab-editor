"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/supabase";

export function useRoomLock(roomId: string) {
  // activeLock stores who is doing what (e.g., { user: "Alice", action: "saving the project" })
  const [activeLock, setActiveLock] = useState<{ user: string; action: string } | null>(null);
  
  const channelRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create a dedicated ephemeral channel for this room's UI locks
    const channel = supabase.channel(`room-locks-${roomId}`, {
      config: { broadcast: { self: true } } // self: true ensures the sender ALSO gets locked
    });

    channel.on('broadcast', { event: 'acquire' }, ({ payload }) => {
      setActiveLock({ user: payload.user, action: payload.action });
      
      // SAFETY NET: Auto-release the lock after 15 seconds 
      // in case the person saving closes their tab or crashes
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveLock(null);
      }, 15000);
    });

    channel.on('broadcast', { event: 'release' }, () => {
      setActiveLock(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [roomId]);

  const acquireLock = async (user: string, action: string) => {
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'acquire',
      payload: { user, action }
    });
  };

  const releaseLock = async () => {
    await channelRef.current?.send({
      type: 'broadcast',
      event: 'release'
    });
  };

  return { activeLock, acquireLock, releaseLock };
}