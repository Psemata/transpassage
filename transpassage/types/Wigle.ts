export default interface Wigle {
  accuracymeters: number;
  altitudemeters: number;
  authmode: string;
  channel: number | null;
  currentlatitude: number;
  currentlongitude: number;
  firstseen: string;
  frequency: number;
  mac: string;
  mfgrid: number | null;
  rcois: number | null;
  rssi: number;
  ssid: string | null;
  type: string;
}
