export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
    webcast: string | null;
    wikipedia: string | null;
  };
  launchpad: string;
  details: string | null;
  flight_number: number;
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  details: string;
  status: string;
  launch_attempts: number;
  launch_successes: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}