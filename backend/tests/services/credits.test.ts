import { CreditsService } from '../../src/services/credits.js';
import { CREDIT_REASONS } from '../../src/types/index.js';
import { testPrisma } from '../setup.js';

describe('CreditsService', () => {
  let creditsService: CreditsService;
  let testUser: any;

  beforeEach(async () => {
    creditsService = new CreditsService(testPrisma);
    
    // Create test user
    testUser = await testPrisma.user.create({
      data: {
        fid: 1001,
        fname: 'testuser',
        wallets: [],
        creditsBalanceCents: 1000, // $10.00
      }
    });
  });

  describe('chargeUser', () => {
    it('should charge user and create ledger entry', async () => {
      await creditsService.chargeUser(testUser.id, 500, CREDIT_REASONS.POST_IMAGE);

      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(updatedUser?.creditsBalanceCents).toBe(500);

      const ledgerEntry = await testPrisma.creditsLedger.findFirst({
        where: { userId: testUser.id }
      });

      expect(ledgerEntry).toBeTruthy();
      expect(ledgerEntry?.deltaCents).toBe(-500);
      expect(ledgerEntry?.reason).toBe(CREDIT_REASONS.POST_IMAGE);
    });

    it('should throw error for insufficient credits', async () => {
      await expect(
        creditsService.chargeUser(testUser.id, 1500, CREDIT_REASONS.POST_IMAGE)
      ).rejects.toThrow('Insufficient credits');
    });
  });

  describe('checkDailyFreeStatus', () => {
    it('should return true for both free statuses on new user', async () => {
      const status = await creditsService.checkDailyFreeStatus(testUser.id);

      expect(status.freeImageAvailable).toBe(true);
      expect(status.freeLikeAvailable).toBe(true);
    });

    it('should return false after using daily free', async () => {
      await creditsService.useDailyFree(testUser.id, 'image');

      const status = await creditsService.checkDailyFreeStatus(testUser.id);

      expect(status.freeImageAvailable).toBe(false);
      expect(status.freeLikeAvailable).toBe(true);
    });
  });
});
