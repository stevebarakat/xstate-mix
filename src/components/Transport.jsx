import { useEffect, useRef } from "react";
import { Player, Channel, loaded, Destination, Transport as t } from "tone";
import { dBToPercent, scale } from "../utils/scale";
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
            PAUSE: "paused",
          },
        },
        paused: {
          on: {
            PLAY: "playing",
          },
        },
        stopped: {
          on: {
            STOP: "stopped",
          },
        },
        rewinding: {
          on: {
            REWIND: "rewinding",
          },
        },
        forwarding: {
          on: {
            FORWARDING: "forwarding",
          },
        },
        changingVolume: {
          on: {
            CHANGE_VOLUME: "changingVolume",
          },
        },
      },
    },
  },
  predictableActionArguments: true,
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

  function changeVolume(e) {
    const id = parseInt(e.target.id.at(-1));
    const value = parseFloat(e.target.value);
    const scaled = dBToPercent(scale(value));
    channels.current[id].volume.value = scaled;
  }

  return state.value === "loading" ? (
    "loading..."
  ) : (
    <div>
      <div>
        {tracks.map((track, i) => {
          return (
            <div key={track.id}>
              <input
                id={`track${i}`}
                type="range"
                min="-100"
                max="12"
                step="0.1"
                onChange={(e) => {
                  send("CHANGE_VOLUME");
                  const id = parseInt(e.target.id.at(-1));
                  const value = parseFloat(e.target.value);
                  const scaled = dBToPercent(scale(value));
                  channels.current[id].volume.value = scaled;
                }}
              />
              <label htmlFor={`track${i}`}>{track.name}</label>
            </div>
          );
        })}
      </div>
      <div className="transport-controls">
        <button
          onClick={() => {
            if (state?.matches({ loaded: "playing" })) {
              send("PAUSE");
              t.stop();
              t.seconds = 0;
            } else {
              send("PLAY");
            }
          }}
        >
          STOP
        </button>
        <button
          onClick={() => {
            send("REWIND");
            t.seconds = t.seconds - 10;
          }}
        >
          REW
        </button>
        <button
          onClick={() => {
            if (state?.value?.loaded === "paused") {
              send("PLAY");
              t.start();
            }
            if (state?.value?.loaded === "playing") {
              send("PAUSE");
              t.stop();
            }
          }}
        >
          {state.value.loaded === "paused" ? "PLAY" : "PAUSE"}
        </button>
        <button
          onClick={() => {
            send("FORWARD");
            t.seconds = t.seconds + 10;
          }}
        >
          FF
        </button>
      </div>
    </div>
  );
};
