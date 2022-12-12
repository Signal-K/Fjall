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
  expand?: {
    launch_service_provider?: {
      name: string;
      logo_url?: string;
    };
    launchpad?: {
      name: string;
    };
  }
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

  