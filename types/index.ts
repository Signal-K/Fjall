export interface Launch {
    id: string;
    name: string;
    net: string;
    image: string | null;
    status: {
      name: string;
    };
    launch_service_provider: {
      name: string;
    };
    mission: {
      name: string;
      description: string;
      type: string;
    } | null;
  }
  
  