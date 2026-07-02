export interface RoadmapResource {
  name: string;
  url: string | null; // null if "Link Pending"
}

export interface RoadmapResources {
  basic: RoadmapResource[];
  intermediate: RoadmapResource[];
  advanced: RoadmapResource[];
  cv?: {
    basic: RoadmapResource[];
    parked: { name: string; url?: string | null }[];
  };
  optionalProject?: string;
}

export interface RoadmapItem {
  id: string;
  ttl: string;
  learn: string;
  skip: string;
  search: string;
  keystone?: boolean;
  optional?: boolean;
}

export interface RoadmapGroup {
  title: string;
  items: RoadmapItem[];
}

export interface RoadmapProject {
  id: string;
  ttl: string;
  learn: string;
  search: string;
  paper: string[];
  build: string[];
  done: string[];
  keystone?: boolean;
}

export interface RoadmapGateCriteria {
  id: string;
  text: string;
}

export interface RoadmapGate {
  title: string;
  criteria: RoadmapGateCriteria[];
}

export interface RoadmapPhase {
  id: string;
  name: string;
  theory: string;
  pyslice: string;
  groups: RoadmapGroup[];
  projects: RoadmapProject[];
  gate: RoadmapGate;
  resources: RoadmapResources;
}
