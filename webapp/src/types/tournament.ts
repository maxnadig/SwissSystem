export interface Player {
  id: string;
  name: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  buchholzScore: number;
  hadBye: boolean;
}

export interface Game {
  player1Id: string;
  player2Id: string | null;
  points1: number;
  points2: number;
  confirmed: boolean;
}

export interface Round {
  number: number;
  games: Game[];
  isPreset: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  numCourts: number;
  players: Player[];
  rounds: Round[];
  createdAt: string;
}

export interface GamePrediction {
  player1Id: string;
  player2Id: string | null;
  confidence: number;
}
