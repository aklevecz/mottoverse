export type Position = {
  lat: number | undefined;
  lng: number | undefined;
};

export type MarkerType = "cartons" | "users" | "create" | "mottos";

export type Marker = {
  type: string;
  marker: google.maps.Marker;
};

export enum TxState {
  Idle,
  Mining,
  Completed,
  Error,
}
