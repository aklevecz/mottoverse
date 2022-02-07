import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { Loader } from "@googlemaps/js-api-loader";
import silverMap from "./mapStyling.json";
import smilerSVG from "./userLocationIcon.svg";
import { Marker, MarkerType, Position } from "./types";
import { delay, getMarker } from "./utils";
import { getMotto } from "../firebase";

type Action =
  | { type: "createMarker" }
  | { type: "initMap"; map: google.maps.Map }
  | { type: "updateUserPosition"; userLocation: Position }
  | { type: "updateMarkers"; markerType: MarkerType; markers: Array<Marker> }
  | { type: "addMarker"; markerType: MarkerType; marker: Marker }
  | { type: "deleteMarker"; markerType: MarkerType; id: string }
  | {
      type: "collectIconSelectors";
      iconType: string;
      icons: Array<HTMLElement>;
    };

type Dispatch = (action: Action) => void;

type State = {
  loading: boolean;
  markers: Record<MarkerType, Array<Marker>>;
  icons: Record<string, Array<HTMLElement> | HTMLElement | undefined>;
  map: google.maps.Map | undefined;
  mapContainer: HTMLDivElement | undefined;
  userLocation: Position;
};

const initialState = {
  loading: true,
  markers: { cartons: [], users: [], create: [], mottos: [] },
  icons: { cartons: [], user: undefined },
  map: undefined,
  mapContainer: undefined,
  userLocation: { lat: undefined, lng: undefined },
};

const MapContext = createContext<
  { state: State; dispatch: Dispatch } | undefined
>(undefined);

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "updateMarkers":
      return {
        ...state,
        markers: { ...state.markers, [action.markerType]: action.markers },
      };
    case "addMarker":
      const markersOfType = state.markers[action.markerType];
      markersOfType.push(action.marker);
      return {
        ...state,
        markers: { ...state.markers, [action.markerType]: markersOfType },
      };
    case "deleteMarker":
      // Refactor name and type need to be reconciled
      const newTypeMarkers = state.markers[action.markerType].filter(
        (marker) => marker.type !== action.id
      );
      // return state
      return {
        ...state,
        markers: { ...state.markers, [action.markerType]: newTypeMarkers },
      };
    case "initMap":
      return { ...state, map: action.map, loading: false };
    case "updateUserPosition":
      return { ...state, userLocation: action.userLocation };
    default:
      return state;
  }
};
const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GMAP_KEY as string,
  version: "weekly",
});

const LA_COORDS = {
  lat: 34.04944448684695,
  lng: -118.24629715232342,
};

const DEFAULT_COORDS = LA_COORDS;

const MapProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = { state, dispatch };
  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export { MapContext, MapProvider };

if (typeof window !== "undefined")
  (window as any).globalClickPosition = { lat: 0, lng: 0 };

export const useMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const placeMottoPosRef = useRef<Position>({ lat: 0, lng: 0 });
  const context = useContext(MapContext);

  if (context === undefined) {
    throw new Error("must be within its provider: User");
  }

  const { dispatch, state } = context;

  const initMap = useCallback(() => {
    console.log("initing map");
    loader.load().then(() => {
      if (!mapContainer.current) {
        return console.error("map container missing");
      }
      const map = new google.maps.Map(mapContainer.current, {
        zoom: 13,
        styles: silverMap,
        center: {
          lat: DEFAULT_COORDS.lat,
          lng: DEFAULT_COORDS.lng,
        },
        disableDefaultUI: true, // a way to quickly hide all controls
        // mapTypeControl: true,
        // scaleControl: true,
        // zoomControl: true,
      });
      dispatch({ type: "initMap", map });

      map.addListener("click", (mapsMouseEvent: any) => {
        // const pos = mapsMouseEvent.latLng.toJSON();
        // (window as any).globalClickPosition = pos;
        // document.getElementById(
        //   "click-pos"
        // )!.innerHTML = `Latitude: ${pos.lat} Longitude ${pos.lng}`;
      });
    });
  }, [dispatch]);

  const createDraggableMarker = async (id: string) => {
    const motto = await getMotto(id);
    if (!motto) {
      return console.error("something went wrong fetching motto metadata");
    }
    const img = new Image();
    img.onload = () => {
      // const position =
      //   state.userLocation.lat && state.userLocation.lng
      //     ? (state.userLocation as google.maps.LatLngLiteral)
      //     : { lat: LA_COORDS.lat, lng: LA_COORDS.lng };
      const position = state.map?.getCenter();
      const icon = {
        url: img.src,
        scaledSize: new google.maps.Size(200, 200),
      };
      const marker = new google.maps.Marker({
        icon,
        position,
        map: state.map,
        draggable: true,
      });

      dispatch({
        type: "updateMarkers",
        markerType: "create",
        markers: [{ marker, type: "create" }],
      });

      marker.addListener("drag", (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        placeMottoPosRef.current = { lat, lng };
      });
    };
    img.src = motto.image;
  };

  const removeDraggableMarker = () => {
    const dragMarker = state.markers.create.find(
      (marker) => marker.type === "create"
    );
    if (dragMarker) {
      dragMarker.marker.setMap(null);
      dispatch({ type: "deleteMarker", markerType: "create", id: "create" });
    }
  };
  // singular
  const createMottoMarkers = async (
    lat: number,
    lng: number,
    imgUrl: string
  ) => {
    const position = { lat, lng };
    const icon = {
      url: imgUrl,
      scaledSize: new google.maps.Size(100, 100),
    };
    const mottoMaker = new google.maps.Marker({
      icon,
      position: position,
      map: state.map,
      // optimized: false,
      title: "motto",
    });
    // console.log("hi");
    return mottoMaker;
  };

  const batchCreateMottoMarkers = async (
    markers: any[],
    markerType: MarkerType
  ) => {
    const oldIds = state.markers[markerType].map((marker) => marker.type);
    const newMarkers: any[] = [];
    markers.forEach((marker) => {
      const newMarker = createMottoMarkers(
        marker.lat,
        marker.lng,
        marker.image
      );
      if (!oldIds.includes(marker.id)) {
        newMarkers.push({ marker: newMarker, type: marker.id });
      }
    });
    dispatch({
      type: "updateMarkers",
      markerType,
      markers: [...newMarkers, ...state.markers[markerType]],
    });
  };

  // doesnt update yet -- not being used
  const createUpdateMottoMarker = async (marker: any) => {
    const mapMarker = await createMottoMarkers(
      marker.lat,
      marker.lng,
      marker.image
    );
    dispatch({
      type: "addMarker",
      markerType: "mottos",
      marker: { marker: mapMarker, type: "mottos" },
    });
  };

  const hideMarkers = () => {
    for (const marker of state.markers.cartons) {
      marker.marker.setMap(null);
    }
  };

  return {
    mapContainer,
    hideMarkers,
    initMap,
    createMottoMarkers,
    createUpdateMottoMarker,
    batchCreateMottoMarkers,
    createDraggableMarker,
    removeDraggableMarker,
    placeMottoPosRef,
    loading: state.loading,
    map: state.map,
    markers: state.markers,
  };
};

export const useUserLocation = () => {
  const context = useContext(MapContext);

  if (context === undefined) {
    throw new Error("Map Context error in UserLocation hook");
  }
  const { dispatch, state } = context;

  const createUserMarker = async (lat: number, lng: number) => {
    const position = { lat, lng };
    const icon = {
      url: smilerSVG.src,
      scaledSize: new google.maps.Size(30, 30),
    };
    const userMarker = new google.maps.Marker({
      position: position,
      icon,
      map: state.map,
      optimized: false,
    });
    dispatch({
      type: "updateMarkers",
      markerType: "users",
      markers: [{ marker: userMarker, type: "user" }],
    });
    const markerDom = await getMarker(`img[src='${smilerSVG.src}']`);
    if (!markerDom) {
      return console.log("marker is gone");
    }
    delay(100, () => {
      markerDom.classList.add("pulse");
      dispatch({
        type: "collectIconSelectors",
        iconType: "user",
        icons: [markerDom],
      });
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch({ type: "updateUserPosition", userLocation: userLoc });
          console.log(state);
          if (!state.userLocation.lat && state.map) {
            state.map.panTo(userLoc as google.maps.LatLngLiteral);
            createUserMarker(userLoc.lat, userLoc.lng);
          }
        }
      );
    }
  };

  const recenter = () => {
    state.map &&
      state.map.panTo(state.userLocation as google.maps.LatLngLiteral);
  };

  useEffect(() => {
    if (state.map && state.markers.users[0]) {
      state.markers.users[0].marker.setPosition(
        state.userLocation as google.maps.LatLngLiteral
      );
    }
  }, [state.userLocation]);

  useEffect(() => {
    if (state.map) {
      console.log("getting user loc");
      getUserLocation();
    }
    return () => {
      dispatch({
        type: "updateUserPosition",
        userLocation: { lat: undefined, lng: undefined },
      });
    };
  }, [state.map]);

  return {
    getUserLocation,
    userLocation: state.userLocation,
    createUserMarker,
    recenter,
  };
};

// export const useCreateCartonMarker = () => {
//   const context = useContext(MapContext);
//   const [position, setPosition] = useState({ lat: 0, lng: 0 });

//   if (context === undefined) {
//     throw new Error("Map Context error in CreateCartonMarker hook");
//   }

//   const { dispatch, state } = context;

//   const createCartonMarker = () => {
//     if (!state.map) {
//       return console.error("map is missing");
//     }
//     const icon = {
//       // url: cartonSVG,
//       scaledSize: new google.maps.Size(35, 35),
//     };
//     const userPosition = {
//       lat: state.userLocation.lat,
//       lng: state.userLocation.lng,
//     };
//     const cameraPosition = state.map.getCenter()!.toJSON();
//     const position =
//       state.userLocation.lat && state.userLocation.lng
//         ? cameraPosition
//         : DEFAULT_COORDS;

//     const marker = new google.maps.Marker({
//       position,
//       // icon,
//       map: state.map,
//       draggable: true,
//     });
//     dispatch({
//       type: "updateMarkers",
//       markerType: "create",
//       markers: [{ marker, type: "create" }],
//     });

//     marker.addListener("drag", (e: google.maps.MapMouseEvent) => {
//       const lat = e.latLng?.lat();
//       const lng = e.latLng?.lng();
//       if (lat && lng) setPosition({ lat, lng });
//     });
//   };

//   const removeCreateMarker = () => {
//     dispatch({ type: "deleteMarker", markerType: "create", id: "create" });

//     // change type to id
//     const createMarker = state.markers.create.find(
//       (marker) => marker.type === "create"
//     );
//     createMarker && createMarker.marker.setMap(null);
//     // marker.setMap(null);
//   };

//   return { createCartonMarker, removeCreateMarker, position };
// };
