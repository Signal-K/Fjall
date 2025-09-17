// From PocketBase `events` collection
export interface PBEvent {
  id: string;
  collectionId: string;
  title: string;
  datetime: string;
  type: 'rocket_launch' | 'station_patch';
  source_url: string;
  description?: string;
  image: string; // The filename for the launch image
  spacedevs_id?: string;
  mission_id?: string;
  pad_id?: string;
  expand?: {
    spacedevs_id?: {
      name: string;
      logo_url?: string;
      type?: string;
      country_code?: string;
    };
    launchpad?: {
      name: string;
    };
  }
}

// From PocketBase `missions` collection
export interface Mission {
  id: string;
  collectionId: string;
  name: string;
  description?: string;
  orbit_type?: string;
}

// From PocketBase `pads` collection
export interface Pad {
  id: string;
  collectionId: string;
  name: string;
  latitude?: number;
  longitude?: number;
  map_url?: string;
  country_code?: string;
}

// From PocketBase `payloads` collection
export interface Payload {
  id: string;
  collectionId: string;
  name: string;
  description?: string;
  image_url: string;
  type?: string;
  mass_kg?: number;
  manufacturer?: string;
  expand?: {
    manufacturer?: {
      name: string;
    };
  }
}

  