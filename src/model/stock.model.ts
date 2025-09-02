export interface Stock {
  symbol: string;
  price: number;
  dayMax: number;
  dayMin: number;
  dayOpen: number;
  lastUpdate: string;
  change: number;
  percentChange: number;
}

export enum ConnectionStatus {
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Reconnecting = 'Reconnecting',
  Error = 'Error',
}
