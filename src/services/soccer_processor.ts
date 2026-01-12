// ============================================================================
// SOCCER GAME PROCESSOR - USAGE GUIDE
// ============================================================================

/**
 * Soccer Game Processor - Usage Guide
 *
 * This processor analyzes real-time soccer telemetry data to detect game events,
 * track statistics, and provide live match insights.
 *
 * First, import the processor and types:
 *
 * ```typescript
 * import { SoccerGameProcessor, GameState, Player, Ball, Referee } from './soccer-processor';
 * ```
 *
 * Step 1: Initialize the Processor
 * Create a new processor instance with your pitch dimensions:
 *
 * ```typescript
 * const processor = new SoccerGameProcessor({
 *   width: 1000, // Pitch width in pixels/units
 *   height: 600, // Pitch height in pixels/units
 *   goalWidth: 80, // Goal width
 *   goalDepth: 10, // Goal depth
 *   penaltyBoxWidth: 220, // Penalty box width
 *   penaltyBoxHeight: 165 // Penalty box length from goal line
 * });
 * ```
 *
 * Step 2: Prepare Your Telemetry Data
 * Your tracking system should provide data in this format:
 *
 * ```typescript
 * const currentState: GameState = {
 *   players: [
 *     {
 *       id: 'A1',
 *       team: 'A',
 *       role: 'goalkeeper',
 *       position: { x: 50, y: 300 }
 *     },
 *     {
 *       id: 'A2',
 *       team: 'A',
 *       role: 'defender',
 *       position: { x: 200, y: 150 }
 *     },
 *     // ... more players
 *   ],
 *   ball: {
 *     position: { x: 500, y: 300 },
 *     velocity: { x: 10, y: 5 } // Optional
 *   },
 *   referees: [
 *     { id: 'R1', position: { x: 450, y: 350 } },
 *     { id: 'R2', position: { x: 100, y: 100 } }
 *   ],
 *   timestamp: Date.now()
 * };
 * ```
 *
 * Step 3: Process Telemetry Stream (Every 500ms)
 *
 * ```typescript
 * function processTelemetryStream() {
 *   // Get coordinates from your tracking system
 *   const currentState = getCoordinatesFromTrackingSystem();
 *
 *   // Process the frame
 *   const events = processor.processFrame(currentState);
 *   // Get statistics
 *   const stats = processor.getStats();
 *   const possession = processor.getPossessionPercentage();
 *
 *   // Return combined output
 *   return {
 *     telemetry: currentState,
 *     events: events,
 *     metadata: {
 *       score: {
 *         teamA: stats.teamAScore,
 *         teamB: stats.teamBScore
 *       },
 *       possession: {
 *         current: stats.teamInControl,
 *         percentages: {
 *           teamA: possession.A.toFixed(1) + '%',
 *           teamB: possession.B.toFixed(1) + '%'
 *         }
 *       },
 *       passes: {
 *         teamA: stats.teamAPasses,
 *         teamB: stats.teamBPasses
 *       },
 *       fouls: {
 *         teamA: stats.fouls.A,
 *         teamB: stats.fouls.B
 *       },
 *       corners: {
 *         teamA: stats.corners.A,
 *         teamB: stats.corners.B
 *       },
 *       cards: {
 *         yellow: {
 *           teamA: stats.yellowCards.A,
 *           teamB: stats.yellowCards.B
 *         },
 *         red: {
 *           teamA: stats.redCards.A,
 *           teamB: stats.redCards.B
 *         }
 *       }
 *     }
 *   };
 * }
 * ```
 *
 * Step 4: Start the Stream
 * Run the processor at 500ms intervals:
 *
 * ```typescript
 * const streamInterval = setInterval(() => {
 *   const output = processTelemetryStream();
 *
 *   // Send output to your API, database, or UI
 *   console.log('Timestamp:', output.telemetry.timestamp);
 *   console.log('Events:', output.events);
 *   console.log('Metadata:', output.metadata);
 *
 * }, 500);
 * ```
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Point {
  x: number;
  y: number;
}

interface Player {
  id: string;
  team: 'A' | 'B';
  position: Point;
  role: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
}

interface Ball {
  position: Point;
  velocity?: Point;
}

interface Referee {
  id: string;
  position: Point;
}

interface GameState {
  players: Player[];
  ball: Ball;
  referees: Referee[];
  timestamp: number;
}

interface PitchDimensions {
  width: number;
  height: number;
  goalWidth: number;
  goalDepth: number;
  penaltyBoxWidth: number;
  penaltyBoxHeight: number;
}

interface GameEvent {
  type: 'goal' | 'penalty' | 'pass' | 'possession_change' | 'offside' | 'player_change' | 
        'corner' | 'throw_in' | 'free_kick' | 'yellow_card' | 'red_card' | 'goal_kick' | 
        'substitution' | 'foul';
  timestamp: number;
  team?: 'A' | 'B';
  player?: string;
  details?: any;
}

interface GameStats {
  teamAScore: number;
  teamBScore: number;
  teamAPasses: number;
  teamBPasses: number;
  teamInControl: 'A' | 'B' | null;
  possessionTime: { A: number; B: number };
  fouls: { A: number; B: number };
  corners: { A: number; B: number };
  yellowCards: { A: string[]; B: string[] };
  redCards: { A: string[]; B: string[] };
  throwIns: { A: number; B: number };
  freeKicks: { A: number; B: number };
  events: GameEvent[];
}

// ============================================================================
// SOCCER GAME PROCESSOR CLASS
// ============================================================================

class SoccerGameProcessor {
  private pitchDimensions: PitchDimensions;
  private previousState: GameState | null = null;
  private stats: GameStats;
  private lastBallHolder: string | null = null;
  private possessionStartTime: number = 0;
  private passThreshold: number = 50; // Distance threshold for detecting passes
  private controlDistance: number = 30; // Distance to consider player in control

  constructor(pitchDimensions: PitchDimensions) {
    this.pitchDimensions = pitchDimensions;
    this.stats = {
      teamAScore: 0,
      teamBScore: 0,
      teamAPasses: 0,
      teamBPasses: 0,
      teamInControl: null,
      possessionTime: { A: 0, B: 0 },
      fouls: { A: 0, B: 0 },
      corners: { A: 0, B: 0 },
      yellowCards: { A: [], B: [] },
      redCards: { A: [], B: [] },
      throwIns: { A: 0, B: 0 },
      freeKicks: { A: 0, B: 0 },
      events: []
    };
  }

  // ============================================================================
  // MAIN PROCESSING METHOD
  // ============================================================================

  processFrame(currentState: GameState): GameEvent[] {
    const events: GameEvent[] = [];

    if (!this.previousState) {
      this.previousState = currentState;
      this.updatePossession(currentState);
      return events;
    }

    // Check for out of bounds (corners, throw-ins, goal kicks)
    const outEvent = this.detectOutOfBounds(currentState);
    if (outEvent) events.push(outEvent);

    // Check for goals
    const goalEvent = this.detectGoal(currentState);
    if (goalEvent) events.push(goalEvent);

    // Check for passes
    const passEvent = this.detectPass(currentState);
    if (passEvent) events.push(passEvent);

    // Check for possession changes
    const possessionEvent = this.detectPossessionChange(currentState);
    if (possessionEvent) events.push(possessionEvent);

    // Check for fouls
    const foulEvent = this.detectFoul(currentState);
    if (foulEvent) events.push(foulEvent);

    // Check for offside
    const offsideEvent = this.detectOffside(currentState);
    if (offsideEvent) events.push(offsideEvent);

    // Check for penalty situations
    const penaltyEvent = this.detectPenalty(currentState);
    if (penaltyEvent) events.push(penaltyEvent);

    // Update possession time
    this.updatePossessionTime(currentState);

    // Store events
    this.stats.events.push(...events);

    // Update previous state
    this.previousState = currentState;

    return events;
  }

  // ============================================================================
  // GOAL DETECTION
  // ============================================================================

  private detectGoal(state: GameState): GameEvent | null {
    const ball = state.ball;
    const { width, height, goalWidth, goalDepth } = this.pitchDimensions;

    const goalCenterY = height / 2;
    const goalTop = goalCenterY - goalWidth / 2;
    const goalBottom = goalCenterY + goalWidth / 2;

    // Check left goal (Team B scores)
    if (ball.position.x <= goalDepth && 
        ball.position.y >= goalTop && 
        ball.position.y <= goalBottom) {
      
      if (this.previousState && this.previousState.ball.position.x > goalDepth) {
        this.stats.teamBScore++;
        return {
          type: 'goal',
          timestamp: state.timestamp,
          team: 'B',
          details: { score: { A: this.stats.teamAScore, B: this.stats.teamBScore } }
        };
      }
    }

    // Check right goal (Team A scores)
    if (ball.position.x >= width - goalDepth && 
        ball.position.y >= goalTop && 
        ball.position.y <= goalBottom) {
      
      if (this.previousState && this.previousState.ball.position.x < width - goalDepth) {
        this.stats.teamAScore++;
        return {
          type: 'goal',
          timestamp: state.timestamp,
          team: 'A',
          details: { score: { A: this.stats.teamAScore, B: this.stats.teamBScore } }
        };
      }
    }

    return null;
  }

  // ============================================================================
  // PASS DETECTION
  // ============================================================================

  private detectPass(state: GameState): GameEvent | null {
    const currentHolder = this.getPlayerWithBall(state);
    
    if (!currentHolder || !this.lastBallHolder) {
      this.lastBallHolder = currentHolder?.id || null;
      return null;
    }

    // If ball holder changed
    if (currentHolder.id !== this.lastBallHolder) {
      const previousHolder = state.players.find(p => p.id === this.lastBallHolder);
      
      if (previousHolder && currentHolder.team === previousHolder.team) {
        // Same team - it's a pass
        const team = currentHolder.team;
        if (team === 'A') {
          this.stats.teamAPasses++;
        } else {
          this.stats.teamBPasses++;
        }

        this.lastBallHolder = currentHolder.id;
        
        return {
          type: 'pass',
          timestamp: state.timestamp,
          team: team,
          player: previousHolder.id,
          details: {
            from: previousHolder.id,
            to: currentHolder.id,
            distance: this.distance(previousHolder.position, currentHolder.position)
          }
        };
      }
      
      this.lastBallHolder = currentHolder.id;
    }

    return null;
  }

  // ============================================================================
  // POSSESSION DETECTION
  // ============================================================================

  private detectPossessionChange(state: GameState): GameEvent | null {
    const currentHolder = this.getPlayerWithBall(state);
    const currentTeam = currentHolder?.team || null;

    if (currentTeam && currentTeam !== this.stats.teamInControl) {
      const previousTeam = this.stats.teamInControl;
      this.stats.teamInControl = currentTeam;
      this.possessionStartTime = state.timestamp;

      if (previousTeam) {
        return {
          type: 'possession_change',
          timestamp: state.timestamp,
          team: currentTeam,
          details: { from: previousTeam, to: currentTeam }
        };
      }
    }

    return null;
  }

  // ============================================================================
  // OFFSIDE DETECTION
  // ============================================================================

  private detectOffside(state: GameState): GameEvent | null {
    const ballHolder = this.getPlayerWithBall(state);
    if (!ballHolder) return null;

    const { width } = this.pitchDimensions;
    const halfwayLine = width / 2;

    // Check offside for team A (attacking right)
    if (ballHolder.team === 'A') {
      const attackingPlayers = state.players.filter(
        p => p.team === 'A' && p.position.x > halfwayLine && p.role !== 'goalkeeper'
      );

      const defendingPlayers = state.players.filter(
        p => p.team === 'B' && p.role !== 'goalkeeper'
      );

      // Find second-to-last defender
      const sortedDefenders = defendingPlayers.sort((a, b) => b.position.x - a.position.x);
      const offsideLine = sortedDefenders.length > 1 
        ? sortedDefenders[1].position.x 
        : sortedDefenders[0]?.position.x || width;

      for (const attacker of attackingPlayers) {
        if (attacker.id !== ballHolder.id && attacker.position.x > offsideLine) {
          return {
            type: 'offside',
            timestamp: state.timestamp,
            team: 'A',
            player: attacker.id,
            details: { position: attacker.position }
          };
        }
      }
    }

    // Check offside for team B (attacking left)
    if (ballHolder.team === 'B') {
      const attackingPlayers = state.players.filter(
        p => p.team === 'B' && p.position.x < halfwayLine && p.role !== 'goalkeeper'
      );

      const defendingPlayers = state.players.filter(
        p => p.team === 'A' && p.role !== 'goalkeeper'
      );

      const sortedDefenders = defendingPlayers.sort((a, b) => a.position.x - b.position.x);
      const offsideLine = sortedDefenders.length > 1 
        ? sortedDefenders[1].position.x 
        : sortedDefenders[0]?.position.x || 0;

      for (const attacker of attackingPlayers) {
        if (attacker.id !== ballHolder.id && attacker.position.x < offsideLine) {
          return {
            type: 'offside',
            timestamp: state.timestamp,
            team: 'B',
            player: attacker.id,
            details: { position: attacker.position }
          };
        }
      }
    }

    return null;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  // ============================================================================
  // OUT OF BOUNDS DETECTION (Corners, Throw-ins, Goal Kicks)
  // ============================================================================

  private detectOutOfBounds(state: GameState): GameEvent | null {
    const { width, height } = this.pitchDimensions;
    const ball = state.ball;
    const prevBall = this.previousState!.ball;

    // Check if ball went out of bounds
    const outOfBounds = 
      ball.position.x < 0 || ball.position.x > width ||
      ball.position.y < 0 || ball.position.y > height;

    if (!outOfBounds) return null;

    // Determine last team to touch the ball
    const lastToucher = this.getPlayerWithBall(this.previousState!);
    if (!lastToucher) return null;

    const opposingTeam = lastToucher.team === 'A' ? 'B' : 'A';

    // Ball went out on the sides (throw-in)
    if (ball.position.y < 0 || ball.position.y > height) {
      this.stats.throwIns[opposingTeam]++;
      return {
        type: 'throw_in',
        timestamp: state.timestamp,
        team: opposingTeam,
        details: { 
          position: { 
            x: Math.max(0, Math.min(width, ball.position.x)), 
            y: ball.position.y < 0 ? 0 : height 
          },
          lastTouch: lastToucher.team
        }
      };
    }

    // Ball went out on the ends
    if (ball.position.x < 0 || ball.position.x > width) {
      const isLeftSide = ball.position.x < 0;
      const isCorner = this.isCornerKick(ball.position, lastToucher.team, isLeftSide);

      if (isCorner) {
        // Corner kick
        this.stats.corners[opposingTeam]++;
        return {
          type: 'corner',
          timestamp: state.timestamp,
          team: opposingTeam,
          details: {
            side: isLeftSide ? 'left' : 'right',
            position: {
              x: isLeftSide ? 0 : width,
              y: ball.position.y < height / 2 ? 0 : height
            }
          }
        };
      } else {
        // Goal kick
        return {
          type: 'goal_kick',
          timestamp: state.timestamp,
          team: opposingTeam,
          details: {
            side: isLeftSide ? 'left' : 'right'
          }
        };
      }
    }

    return null;
  }

  private isCornerKick(ballPos: Point, lastTouchTeam: 'A' | 'B', isLeftSide: boolean): boolean {
    // If ball went out on the side where the team was attacking, it's likely a corner
    // Team A attacks right (x > width/2), Team B attacks left (x < width/2)
    if (lastTouchTeam === 'A' && !isLeftSide) {
      return false; // Team A attacking right, ball went out right = goal kick
    }
    if (lastTouchTeam === 'B' && isLeftSide) {
      return false; // Team B attacking left, ball went out left = goal kick
    }
    return true; // Otherwise it's a corner
  }

  // ============================================================================
  // FOUL DETECTION
  // ============================================================================

  private detectFoul(state: GameState): GameEvent | null {
    // Detect fouls based on player proximity and ball possession
    const ballHolder = this.getPlayerWithBall(state);
    if (!ballHolder) return null;

    // Check for nearby opposing players that might be committing a foul
    const opposingPlayers = state.players.filter(p => p.team !== ballHolder.team);
    
    for (const opponent of opposingPlayers) {
      const dist = this.distance(opponent.position, ballHolder.position);
      
      // Very close contact (potential foul)
      if (dist < 10) {
        // Simple foul detection - in reality, you'd need velocity and collision data
        const shouldBeFoul = Math.random() < 0.3; // Simplified probability
        
        if (shouldBeFoul) {
          this.stats.fouls[opponent.team]++;
          this.stats.freeKicks[ballHolder.team]++;
          
          // Determine if it's a card offense (simplified)
          const severity = this.calculateFoulSeverity(dist, ballHolder.position);
          
          if (severity === 'yellow') {
            this.stats.yellowCards[opponent.team].push(opponent.id);
            return {
              type: 'yellow_card',
              timestamp: state.timestamp,
              team: opponent.team,
              player: opponent.id,
              details: { 
                foulOn: ballHolder.id,
                position: opponent.position,
                totalYellows: this.stats.yellowCards[opponent.team].length
              }
            };
          } else if (severity === 'red') {
            this.stats.redCards[opponent.team].push(opponent.id);
            return {
              type: 'red_card',
              timestamp: state.timestamp,
              team: opponent.team,
              player: opponent.id,
              details: { 
                foulOn: ballHolder.id,
                position: opponent.position,
                reason: 'serious_foul_play'
              }
            };
          } else {
            return {
              type: 'foul',
              timestamp: state.timestamp,
              team: opponent.team,
              player: opponent.id,
              details: { 
                foulOn: ballHolder.id,
                position: opponent.position,
                resultingInFreeKick: true
              }
            };
          }
        }
      }
    }

    return null;
  }

  private calculateFoulSeverity(distance: number, position: Point): 'none' | 'yellow' | 'red' {
    // Simplified severity calculation
    // In reality, this would consider: tackle type, ball possession, dangerous play, etc.
    
    const { width, height, penaltyBoxWidth, penaltyBoxHeight } = this.pitchDimensions;
    
    // Check if in penalty box (more severe)
    const inPenaltyBox = 
      (position.x < penaltyBoxHeight || position.x > width - penaltyBoxHeight) &&
      (position.y > (height - penaltyBoxWidth) / 2 && position.y < (height + penaltyBoxWidth) / 2);
    
    if (distance < 5 && inPenaltyBox) {
      return Math.random() < 0.2 ? 'red' : 'yellow';
    } else if (distance < 5) {
      return Math.random() < 0.4 ? 'yellow' : 'none';
    }
    
    return 'none';
  }

  // ============================================================================
  // PENALTY DETECTION
  // ============================================================================

  private detectPenalty(state: GameState): GameEvent | null {
    const { width, height, penaltyBoxWidth, penaltyBoxHeight } = this.pitchDimensions;
    
    const leftPenaltyBox = {
      x1: 0,
      x2: penaltyBoxHeight,
      y1: (height - penaltyBoxWidth) / 2,
      y2: (height + penaltyBoxWidth) / 2
    };

    const rightPenaltyBox = {
      x1: width - penaltyBoxHeight,
      x2: width,
      y1: (height - penaltyBoxWidth) / 2,
      y2: (height + penaltyBoxWidth) / 2
    };

    // Simple penalty detection: opposing team player in penalty box with ball
    const ballHolder = this.getPlayerWithBall(state);
    if (!ballHolder) return null;

    // Check if Team A player is in Team B's penalty box (left)
    if (ballHolder.team === 'A' && this.isInBox(ballHolder.position, leftPenaltyBox)) {
      const defenders = state.players.filter(p => 
        p.team === 'B' && 
        p.role !== 'goalkeeper' &&
        this.isInBox(p.position, leftPenaltyBox) &&
        this.distance(p.position, ballHolder.position) < 20
      );

      if (defenders.length > 0) {
        return {
          type: 'penalty',
          timestamp: state.timestamp,
          team: 'A',
          details: { box: 'left', foul: 'potential' }
        };
      }
    }

    // Check if Team B player is in Team A's penalty box (right)
    if (ballHolder.team === 'B' && this.isInBox(ballHolder.position, rightPenaltyBox)) {
      const defenders = state.players.filter(p => 
        p.team === 'A' && 
        p.role !== 'goalkeeper' &&
        this.isInBox(p.position, rightPenaltyBox) &&
        this.distance(p.position, ballHolder.position) < 20
      );

      if (defenders.length > 0) {
        return {
          type: 'penalty',
          timestamp: state.timestamp,
          team: 'B',
          details: { box: 'right', foul: 'potential' }
        };
      }
    }

    return null;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getPlayerWithBall(state: GameState): Player | null {
    let closestPlayer: Player | null = null;
    let minDistance = this.controlDistance;

    for (const player of state.players) {
      const dist = this.distance(player.position, state.ball.position);
      if (dist < minDistance) {
        minDistance = dist;
        closestPlayer = player;
      }
    }

    return closestPlayer;
  }

  private updatePossession(state: GameState): void {
    const holder = this.getPlayerWithBall(state);
    if (holder) {
      this.stats.teamInControl = holder.team;
      this.possessionStartTime = state.timestamp;
    }
  }

  private updatePossessionTime(state: GameState): void {
    if (this.stats.teamInControl && this.previousState) {
      const timeDiff = state.timestamp - this.previousState.timestamp;
      this.stats.possessionTime[this.stats.teamInControl] += timeDiff;
    }
  }

  private distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  private isInBox(point: Point, box: { x1: number; x2: number; y1: number; y2: number }): boolean {
    return point.x >= box.x1 && point.x <= box.x2 && 
           point.y >= box.y1 && point.y <= box.y2;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getStats(): GameStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      teamAScore: 0,
      teamBScore: 0,
      teamAPasses: 0,
      teamBPasses: 0,
      teamInControl: null,
      possessionTime: { A: 0, B: 0 },
      fouls: { A: 0, B: 0 },
      corners: { A: 0, B: 0 },
      yellowCards: { A: [], B: [] },
      redCards: { A: [], B: [] },
      throwIns: { A: 0, B: 0 },
      freeKicks: { A: 0, B: 0 },
      events: []
    };
    this.previousState = null;
    this.lastBallHolder = null;
  }

  getPossessionPercentage(): { A: number; B: number } {
    const total = this.stats.possessionTime.A + this.stats.possessionTime.B;
    if (total === 0) return { A: 0, B: 0 };

    return {
      A: (this.stats.possessionTime.A / total) * 100,
      B: (this.stats.possessionTime.B / total) * 100
    };
  }

  // ============================================================================
  // SUBSTITUTION AND PLAYER MANAGEMENT
  // ============================================================================

  makeSubstitution(team: 'A' | 'B', playerOut: string, playerIn: Player, timestamp: number): GameEvent {
    const event: GameEvent = {
      type: 'substitution',
      timestamp: timestamp,
      team: team,
      player: playerOut,
      details: {
        playerOut: playerOut,
        playerIn: playerIn.id,
        position: playerIn.position
      }
    };

    this.stats.events.push(event);
    return event;
  }

  issueCard(team: 'A' | 'B', playerId: string, cardType: 'yellow' | 'red', timestamp: number): GameEvent {
    if (cardType === 'yellow') {
      this.stats.yellowCards[team].push(playerId);
      
      // Check for second yellow (red card)
      const yellowCount = this.stats.yellowCards[team].filter(id => id === playerId).length;
      if (yellowCount === 2) {
        this.stats.redCards[team].push(playerId);
        return {
          type: 'red_card',
          timestamp: timestamp,
          team: team,
          player: playerId,
          details: { reason: 'second_yellow' }
        };
      }

      return {
        type: 'yellow_card',
        timestamp: timestamp,
        team: team,
        player: playerId,
        details: { totalYellows: yellowCount }
      };
    } else {
      this.stats.redCards[team].push(playerId);
      return {
        type: 'red_card',
        timestamp: timestamp,
        team: team,
        player: playerId,
        details: { reason: 'direct_red' }
      };
    }
  }

  getActivePlayers(team: 'A' | 'B'): number {
    const redCards = this.stats.redCards[team].length;
    return 11 - redCards; // Starting with 11 players minus red cards
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  SoccerGameProcessor,
  type GameState,
  type Player,
  type Ball,
  type Referee,
  type PitchDimensions,
  type GameEvent,
  type GameStats,
  type Point
};