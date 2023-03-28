import { useEffect, useRef } from "react";
import { Player, Channel, loaded, Destination, Transport as t } from "tone";
import { useMachine } from "@xstate/react";
import { assign, createMachine } from "xstate";

const transportMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrADge1WQDoAbPdCAS0ygGIAZAeQEEARAUVYG0AGAXUSh8sSskp5MgkAA9EAWgAsRAEzKAbAFY1yjQBoQAT0QBmHsqIaAvpf1osuAsTIVIRHCXQHqdAAr1mAJoAkgByAOK8AkggwqLiktGyCMoA7EQAjOkp6QAcKXqGiBqZFta2GNj4hKTkEK446ACusJC0PswAqgDKnJFSsWISUklyAJzmOTnKOek6+kYIxemlZSCYeHXw0XaVjv14IoMJoCO5OUST07MFC+ka5lY2IDsO1c5UNPuH8cOIPPOIZQKHirF5VJy1SBfOJDRLydLAi5TGZzQoIYzaFblezgmouCBuDxeT7RAY-OHo5YpFLGBTGfIAhAKBSjUEVV4Q-FuJotCDQo6-BB3DJZXIMtEabIraxAA */
  id: "transport",
  initial: "loading",
  states: {
    loading: {
      on: {
        LOADED: "loaded",
      },
    },

    loaded: {
      initial: "paused",
      states: {
        playing: {
          on: {
            PLAYING: "paused",
          },
        },
        paused: {
          on: {
            PAUSED: "playing",
          },
        },
      },
    },
  },
});

export const Transport = ({ song }) => {
  const tracks = song.tracks;
  const [state, send] = useMachine(transportMachine);
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
  console.log("state.value.loaded", state.value.loaded);

  return state.value === "loading" ? (
    "loading..."
  ) : (
    <div>
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
            console.log("state.value.loaded", state.value.loaded);
            if (state?.value?.loaded === "paused") {
              send("PLAYING");
              t.start();
            }
            if (state?.value?.loaded === "playing") {
              send("PAUSED");
              t.stop();
            }
          }}
        >
          {state.value.loaded === "paused" ? "PLAY" : "PAUSE"}
        </button>
        <button>FF</button>
      </div>
    </div>
  );
};
