/**
 * Generates a URL-friendly slug from a team name
 * @param name - The team name to convert to a slug
 * @returns A lowercase, hyphenated slug
 */
export function generateTeamSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Finds a team by slug, checking against id, slug field, and generated slug from name
 * @param teams - Array of teams to search
 * @param slug - The slug to search for
 * @returns The matching team or undefined
 */
export function findTeamBySlug<T extends { id: string; name: string; slug?: string }>(
    teams: T[],
    slug: string
): T | undefined {
    const normalizedSlug = slug?.toLowerCase();

    return teams.find((team) =>
        team.id === slug ||
        team.slug === slug ||
        generateTeamSlug(team.name) === normalizedSlug
    );
}
