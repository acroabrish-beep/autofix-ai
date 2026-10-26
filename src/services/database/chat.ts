import { databaseService, COLLECTIONS, Query } from './index';
import { ChatRecord } from '../../types';
import { Permission, Role, ID } from 'appwrite';

/**
 * Persists AI chat exchanges in the `chat_history` collection.
 *
 * Expected attributes on the collection:
 *   userId      string
 *   userMessage string
 *   aiResponse  string
 */
export const chatService = {
  /**
   * Save one user message + AI response pair for the given user.
   */
  async saveExchange(input: {
    userId: string;
    userMessage: string;
    aiResponse: string;
  }): Promise<ChatRecord> {
    const permissions = [
      Permission.read(Role.user(input.userId)),
      Permission.update(Role.user(input.userId)),
      Permission.delete(Role.user(input.userId)),
    ];

    return databaseService.createDocument<ChatRecord>(
      COLLECTIONS.CHAT_HISTORY,
      {
        userId: input.userId,
        userMessage: input.userMessage,
        aiResponse: input.aiResponse,
      },
      permissions,
      ID.unique()
    );
  },

  /**
   * Load the most recent conversations for a user (newest first).
   */
  async listUserChats(userId: string, limit = 50): Promise<ChatRecord[]> {
    return databaseService.listDocuments<ChatRecord>(COLLECTIONS.CHAT_HISTORY, [
      Query.equal('userId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);
  },
};
