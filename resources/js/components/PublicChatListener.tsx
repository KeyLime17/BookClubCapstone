import { useEffect } from 'react';

type Props = { clubId: number };

export default function PublicChatListener({ clubId }: Props) {
  useEffect(() => {
    const channelName = `club.${clubId}`;
    const channel = (window as any).Echo.channel(channelName);

    channel.listen('.message.created', (payload: any) => {
      console.log('[Echo] message.created:', payload);
    });

    return () => {
      try { (window as any).Echo.leaveChannel(channelName); } catch {}
    };
  }, [clubId]);

  return null; // no UI yet; just listening
}
