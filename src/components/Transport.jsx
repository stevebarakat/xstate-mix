import { useEffect, useRef } from "react";
import { Player, Channel, loaded, Destination, Transport as t } from "tone";
import { useMachine } from "@xstate/react";
import { createMachine, assign } from "xstate";

console.log(
  assign({
    volume: 100,
  })
);

const transportMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrADge1WQDoAbPdCAS0ygGIAZAeQEEARAUVYG0AGAXUSh8sSskp5MgkAE9EAJgAsPADQgAHvJ4A2IgHYtAVi1yDAX1Oq0WXAWJkKkWgAV6zAJoBJAHIBxXgKQQYVFxSUCNBDkeBSIFLR4ATgBmXQNVWQQkniSiHgMeXQAOAEYTc0sMbHxCIhwSdGlqOidmAFUAZU5-KWCxCSkIqK10xCTDcpArKtta9ABXWEcXd28-fh68ET6w0EHtPWzStJlEBTldIjMJzDwIOCkpm0INrdCBxABaBUKRhGKDOSXCaPap2chUGgvEL9cKIFQnSJKYGVJ5ghwQKHbd4IeEZFIxK4Vayg2r1RqQwK9N6wnG-fIJZHEmY4eaLDGUzbQnbqOG-LQKHJXcxAA */
  id: "transport",
  initial: "loading",
  context: {
    volume: 0,
  },
  states: {
    loading: {
      on: { LOADED: "loaded" },
    },
    loaded: {
      on: { PLAYING: "playing" },
    },
    playing: {
      on: { PAUSED: "paused" },
    },
    paused: {
      on: { PLAYING: "playing" },
    },
  },
});

export const Transport = ({ song }) => {
  const tracks = song.tracks;
  const [state, send] = useMachine(transportMachine);
  const players = useRef(null);
  const channels = useRef(null);
  const { volume } = state.context;

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

    // connect everything
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

  console.log("state.value", state.value);

  return state.value === "loading" ? (
    "loading..."
  ) : (
    <div>
      <div>{console.log("channels", channels.current)}</div>
      <div>
        {tracks.map((track, i) => {
          return (
            <div key={track.id}>
              <input id={`track${i}`} type="range" />
              <label htmlFor={`track${i}`}>{track.name}</label>
            </div>
          );
        })}
      </div>
      <div className="transport-controls">
        <button>REW</button>
        <button
          onClick={() => {
            if (state.value === "loaded" || state.value === "paused") {
              send("PLAYING");
              t.start();
            } else {
              send("PAUSED");
              t.stop();
            }
          }}
        >
          {state.value === "playing" ? "PAUSE" : "PLAY"}
        </button>
        <button>FF</button>
      </div>
      {volume}
    </div>
  );
};
