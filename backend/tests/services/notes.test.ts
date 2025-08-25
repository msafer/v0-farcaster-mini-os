import { NotesService } from '../../src/services/notes.js';
import { testPrisma } from '../setup.js';

describe('NotesService', () => {
  let notesService: NotesService;
  let testUser: any;

  beforeEach(async () => {
    notesService = new NotesService(testPrisma);
    
    testUser = await testPrisma.user.create({
      data: {
        fid: 1001,
        fname: 'testuser',
        lensProfile: 'testuser.lens',
        wallets: [],
        creditsBalanceCents: 1000,
      }
    });
  });

  describe('createNote', () => {
    it('should create note with auto-incremented entry number', async () => {
      const note1 = await notesService.createNote(testUser.id, '# First Note', true);
      expect(note1.entryNumber).toBe(1);

      const note2 = await notesService.createNote(testUser.id, '# Second Note', true);
      expect(note2.entryNumber).toBe(2);

      const note3 = await notesService.createNote(testUser.id, '# Third Note', false);
      expect(note3.entryNumber).toBe(3);
    });

    it('should create note with correct user info', async () => {
      const note = await notesService.createNote(testUser.id, '# Test Note', true);

      expect(note.bodyMd).toBe('# Test Note');
      expect(note.isPublic).toBe(true);
      expect(note.user.fid).toBe(1001);
      expect(note.user.fname).toBe('testuser');
      expect(note.user.lensProfile).toBe('testuser.lens');
    });
  });

  describe('getNotesByUser', () => {
    beforeEach(async () => {
      // Create some notes
      await notesService.createNote(testUser.id, '# Public Note 1', true);
      await notesService.createNote(testUser.id, '# Private Note', false);
      await notesService.createNote(testUser.id, '# Public Note 2', true);
    });

    it('should return only public notes by default', async () => {
      const notes = await notesService.getNotesByUser('testuser');
      
      expect(notes).toHaveLength(2);
      expect(notes.every(note => note.isPublic)).toBe(true);
    });

    it('should return notes in descending order by entry number', async () => {
      const notes = await notesService.getNotesByUser('testuser');
      
      expect(notes[0].entryNumber).toBe(3); // Latest first
      expect(notes[1].entryNumber).toBe(1);
    });

    it('should find user by lens profile', async () => {
      const notes = await notesService.getNotesByUser('testuser.lens');
      
      expect(notes).toHaveLength(2);
    });
  });

  describe('updateNote', () => {
    let testNote: any;

    beforeEach(async () => {
      testNote = await notesService.createNote(testUser.id, '# Original', true);
    });

    it('should update note content and visibility', async () => {
      const updated = await notesService.updateNote(
        testNote.id,
        testUser.id,
        '# Updated Content',
        false
      );

      expect(updated.bodyMd).toBe('# Updated Content');
      expect(updated.isPublic).toBe(false);
      expect(updated.entryNumber).toBe(testNote.entryNumber); // Should not change
    });

    it('should prevent updating another user\'s note', async () => {
      const otherUser = await testPrisma.user.create({
        data: {
          fid: 1002,
          fname: 'otheruser',
          wallets: [],
          creditsBalanceCents: 0,
        }
      });

      await expect(
        notesService.updateNote(testNote.id, otherUser.id, '# Hacked', true)
      ).rejects.toThrow('Cannot edit another user\'s note');
    });
  });
});
