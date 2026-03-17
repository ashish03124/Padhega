import { describe, it, expect } from 'vitest';

// Function extracted for testing (logic from src/app/api/user/xp/route.ts)
const calculateLevel = (xp: number): number => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    return 5;
};

describe('XP Level Calculation', () => {
    it('should return level 1 for XP < 100', () => {
        expect(calculateLevel(0)).toBe(1);
        expect(calculateLevel(99)).toBe(1);
    });

    it('should return level 2 for XP between 100 and 299', () => {
        expect(calculateLevel(100)).toBe(2);
        expect(calculateLevel(299)).toBe(2);
    });

    it('should return level 3 for XP between 300 and 599', () => {
        expect(calculateLevel(300)).toBe(3);
        expect(calculateLevel(599)).toBe(3);
    });

    it('should return level 4 for XP between 600 and 999', () => {
        expect(calculateLevel(600)).toBe(4);
        expect(calculateLevel(999)).toBe(4);
    });

    it('should return level 5 for XP >= 1000', () => {
        expect(calculateLevel(1000)).toBe(5);
        expect(calculateLevel(5000)).toBe(5);
    });
});
