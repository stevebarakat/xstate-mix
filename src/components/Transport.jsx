import { useState, useEffect, useRef } from "react";
import { Player, loaded } from "tone";
import { useMachine } from "@xstate/react";
import { createMachine } from "xstate";

const transportMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrADge1WQDoAbPdCAS0ygGIAZAeQEEARAUVYG0AGAXUSh8sSskp5MgkAE9EAJgAsPADQgAHvJ4A2IgHYtAVi1yDAX1Oq0WXAWJkKkWgAV6zAJoBJAHIBxXgKQQYVFxSUCNBDkeBSIFLR4ATgBmXQNVWQQkniSiHgMeXQAOAEYTc0sMbHxCIhwSdGlqOidmAFUAZU5-KWCxCSkIqK10xCTDcpArKtta9ABXWEcXd28-fh68ET6w0EHtPWzStJlEBTldIjMJzDwIOCkpm0INrdCBxABaBUKRhGKDOSXCaPap2chUGgvEL9cKIFQnSJKYGVJ5ghwQKHbd4IeEZFIxK4Vayg2r1RqQwK9N6wnG-fIJZHEmY4eaLDGUzbQnbqOG-LQKHJXcxAA */
  id: "transport",
  initial: "loading",
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

export const Transport = () => {
  const [state, send] = useMachine(transportMachine);
  const [isLoaded, setIsLoaded] = useState(false);
  const player = useRef(null);
  console.log("loaded", loaded());

  useEffect(() => {
    player.current = new Player("/another-day.mp3");
  }, []);

  useEffect(() => {
    loaded().then(() => setIsLoaded(true));
    send("LOADED");
  }, [setIsLoaded]);

  console.log("state.value", state.value);

  return (
    <button
      onClick={() => {
        if (state.value === "loaded") {
          send("PLAYING");
        } else {
          send("PAUSED");
        }
      }}
    >
      {state.value}
    </button>
  );
};
