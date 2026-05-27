// Types for Service Bay SDK
export interface ServiceRequest {
  id: string;
  robotId: string;
  module: string;
  severity: string;
  predictedFailureInHours: number;
  status: string;
}

export interface Technician {
  id: string;
  name: string;
  certifications: string[];
}

export interface Part {
  sku: string;
  quantity: number;
  site: string;
}
