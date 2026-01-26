import { Fixture, GoalTiming } from '@/models';

export const generateMatchReport = (fixture: Fixture): string => {
    const { homeTeamName, awayTeamName, score, goalTimings } = fixture;
    if (!score) return "No result recorded.";

    const hScore = score.home;
    const aScore = score.away;
    const winner = hScore > aScore ? homeTeamName : aScore > hScore ? awayTeamName : null;
    const loser = hScore > aScore ? awayTeamName : aScore > hScore ? homeTeamName : null;

    let report = "";

    // 1. Headline
    if (!winner) {
        report += `STALEMATE: ${homeTeamName} and ${awayTeamName} share the spoils in a ${hScore}-${aScore} draw. `;
    } else {
        const intensity = Math.abs(hScore - aScore) >= 3 ? "dominant" : "hard-fought";
        report += `VICTORY: ${winner} secure a ${intensity} ${Math.max(hScore, aScore)}-${Math.min(hScore, aScore)} win over ${loser}. `;
    }

    // 2. Goal Analysis
    if (goalTimings && goalTimings.length > 0) {
        const sortedGoals = [...goalTimings].sort((a, b) => a.minute - b.minute);

        report += "\n\nHighlights of the match:";
        sortedGoals.forEach(gt => {
            const team = gt.teamId === fixture.homeTeamId ? homeTeamName : awayTeamName;
            report += `\n• ${gt.minute}': Goal for ${team}${gt.playerName ? ` scored by ${gt.playerName}` : ''}.`;
        });

        const lateWinner = sortedGoals.find(g => g.minute > 85 && winner && ((g.teamId === fixture.homeTeamId && hScore > aScore) || (g.teamId === fixture.awayTeamId && aScore > hScore)));
        if (lateWinner) {
            report += `\n\nDRAMA: ${lateWinner.playerName || 'The striker'} found the net in the dying minutes to seal all three points!`;
        }
    } else {
        report += "\n\nA tactical battle with few clear-cut chances for either side.";
    }

    // 3. Significance
    report += `\n\nThis result will certainly shake up the standings as the season progresses. #Unillsport #${homeTeamName.replace(/\s+/g, '')}V${awayTeamName.replace(/\s+/g, '')}`;

    return report;
};
