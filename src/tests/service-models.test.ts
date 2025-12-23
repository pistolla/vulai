// This is a simple validation script to check if ApiService methods return the expected data structures.
// In a full environment, this would be part of a Jest/Vitest suite.

import { apiService } from '../services/apiService';

async function testServiceModels() {
    console.log('--- Starting Service Model Tests ---');

    const tests = [
        { name: 'Home Data', fn: () => apiService.getHomeData() },
        { name: 'Sports Data', fn: () => apiService.getSportsData() },
        { name: 'Teams Data', fn: () => apiService.getTeamsData() },
        { name: 'Schedule Data', fn: () => apiService.getScheduleData() },
        { name: 'Admin Data', fn: () => apiService.getAdminData() }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing ${test.name}...`);
            const data = await test.fn();

            if (data) {
                console.log(`[PASS] ${test.name} returned data.`);
                // Basic structure validation based on known keys
                if (test.name === 'Home Data' && (!('sports' in data) || !('matches' in data))) {
                    console.error(`[FAIL] ${test.name} missing expected keys.`);
                }
            } else {
                console.error(`[FAIL] ${test.name} returned null/undefined.`);
            }
        } catch (error) {
            console.error(`[ERROR] ${test.name} failed:`, (error as Error).message);
        }
    }

    console.log('--- Service Model Tests Complete ---');
}

// Note: Running this directly might require a mock or real Firebase environment.
// For now, it serves as a structural validation tool.
// testServiceModels().catch(console.error);
console.log('Service model test script created. Run in an environment with Firebase access.');
