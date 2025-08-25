import { PostsService } from '../../src/services/posts.js';
import { StorageService } from '../../src/services/storage.js';
import { ImageService } from '../../src/services/image.js';
import { CreditsService } from '../../src/services/credits.js';
import { testPrisma } from '../setup.js';

// Mock services
jest.mock('../../src/services/storage.js');
jest.mock('../../src/services/image.js');

describe('PostsService', () => {
  let postsService: PostsService;
  let testUser: any;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockImageService: jest.Mocked<ImageService>;

  beforeEach(async () => {
    mockStorageService = new StorageService() as jest.Mocked<StorageService>;
    mockImageService = new ImageService() as jest.Mocked<ImageService>;
    
    const creditsService = new CreditsService(testPrisma);
    postsService = new PostsService(testPrisma, mockStorageService, mockImageService, creditsService);

    // Create test user with free image available
    testUser = await testPrisma.user.create({
      data: {
        fid: 1001,
        fname: 'testuser',
        wallets: [],
        creditsBalanceCents: 1000,
      }
    });

    // Setup mocks
    mockImageService.processAndValidateImage.mockResolvedValue({
      buffer: Buffer.from('processed-image'),
      contentType: 'image/jpeg'
    });
    mockStorageService.uploadImage.mockResolvedValue('https://example.com/image.jpg');
  });

  describe('createPost', () => {
    it('should create post using daily free image', async () => {
      const imageBuffer = Buffer.from('test-image');
      const post = await postsService.createPost(testUser.id, imageBuffer, 'test');

      expect(post.userId).toBe(testUser.id);
      expect(post.imageUrl).toBe('https://example.com/image.jpg');
      expect(post.promptTag).toBe('test');

      // Verify daily free was used
      const user = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(user?.freeImageUsedOn).toBeTruthy();
      expect(user?.creditsBalanceCents).toBe(1000); // No charge
    });

    it('should prevent multiple posts in same day', async () => {
      const imageBuffer = Buffer.from('test-image');
      
      // First post should succeed
      await postsService.createPost(testUser.id, imageBuffer, 'first');

      // Second post should fail
      await expect(
        postsService.createPost(testUser.id, imageBuffer, 'second')
      ).rejects.toThrow('Daily post limit reached');
    });
  });

  describe('likePost', () => {
    let testPost: any;
    let otherUser: any;

    beforeEach(async () => {
      // Create another user for the post
      otherUser = await testPrisma.user.create({
        data: {
          fid: 1002,
          fname: 'otheruser',
          wallets: [],
          creditsBalanceCents: 500,
        }
      });

      // Create a test post
      testPost = await testPrisma.post.create({
        data: {
          userId: otherUser.id,
          imageUrl: 'https://example.com/test.jpg',
          promptTag: 'test',
        }
      });
    });

    it('should create like using daily free', async () => {
      await postsService.likePost(testUser.id, testPost.id);

      const like = await testPrisma.postLike.findFirst({
        where: { userId: testUser.id, postId: testPost.id }
      });

      expect(like).toBeTruthy();

      // Verify post like count increased
      const post = await testPrisma.post.findUnique({
        where: { id: testPost.id }
      });
      expect(post?.likeCountPublic).toBe(1);

      // Verify daily free was used
      const user = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      });
      expect(user?.freeLikeUsedOn).toBeTruthy();
    });

    it('should prevent liking own post', async () => {
      await expect(
        postsService.likePost(otherUser.id, testPost.id)
      ).rejects.toThrow('Cannot like your own post');
    });

    it('should prevent duplicate likes', async () => {
      await postsService.likePost(testUser.id, testPost.id);

      await expect(
        postsService.likePost(testUser.id, testPost.id)
      ).rejects.toThrow('Post already liked');
    });
  });
});
