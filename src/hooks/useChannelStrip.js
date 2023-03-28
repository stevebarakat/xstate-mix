import { useState, useEffect, useRef } from "react";
import { Player, Channel, loaded, Destination, Transport as t } from "tone";

function useChannelStrip({ tracks }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const players = useRef(null);
  const channels = useRef(null);
  useEffect(() => {
    for (let i = 0; i < tracks.length; i++) {
      channels.current = channels.current && [
        ...channels.current,
        new Channel(),
      ];
      players.current = players.current && [
        ...players.current,
        new Player(tracks[i].path),
      ];
    }

    players.current?.forEach((player, i) => {
      channels.current &&
        player.chain(channels.current[i], Destination).sync().start();
    });

    return () => {
      t.stop();
      players.current?.forEach((player, i) => {
        player.disconnect();
        channels.current && channels.current[i].disconnect();
      });
      players.current = [];
      channels.current = [];
    };
  }, [tracks]);

  useEffect(() => {
    loaded().then(() => send("LOADED"));
  }, []);

  return [channels.current, isLoaded];
}

export default useChannelStrip;
