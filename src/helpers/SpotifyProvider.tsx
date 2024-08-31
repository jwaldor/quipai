import {
  useState,
  useEffect,
  useRef,
  FC,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";
import { createContext, useContext } from "react";
import { GameState } from "../App";

export const AccessContext = createContext<{
  gamestate: GameState | undefined;
}>({
  gamestate: undefined,
});

type Props = {
  children: ReactNode;
};

export const SpotifyProvider: FC<Props> = ({ children }) => {
  const [gamestate, setGameState] = useState<GameState | undefined>();

  const clientId = "2695e07f91b64a2bbc0e4551654a330a";
  // const redirectUri = import.meta.env.VITE_REDIRECT_URI;

  // function seekSong()
  useEffect(() => {
    if (accessToken) {
      const services = () => {
        return {
          songSearch: (query: string) =>
            fetch(
              `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                query
              )}&type=track&limit=5`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
          getTop: () =>
            fetch(
              `https://api.spotify.com/v1/me/top/tracks?time_range=short_term`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
          getMe: () =>
            fetch(`https://api.spotify.com/v1/me`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }),
          getRecs: (id: Array<string>) =>
            fetch(
              `https://api.spotify.com/v1/recommendations?seed_tracks=${id.join(
                ","
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            ),
          saveTrack: (id: string) =>
            fetch(
              `https://api.spotify.com/v1/me/tracks
    `,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  ids: [id],
                }),
              }
            ),
        };
      };
      setSpotServices(services);
    } else {
      setSpotServices(undefined);
    }
  }, [accessToken]);

  return (
    <>
      <AccessContext.Provider
        value={{
          accessToken: accessToken,
          setAccessToken: setAccessToken,
          SpotifyServices: SpotifyServices,
        }}
      >
        {children}
      </AccessContext.Provider>
    </>
  );
};
