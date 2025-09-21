import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

// Type definitions
export interface User {
  id: number;
  username: string;
  password: string;
  display_name: string;
  ip_address?: string;
  is_banned: boolean;
  is_muted: boolean;
  social_credit_score: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  category_id: number;
  created_at: string;
  display_name?: string;
  username?: string;
  category_name?: string;
  upvotes?: number;
  downvotes?: number;
  score?: number;
}

export interface Comment {
  id: number;
  content: string;
  user_id: number;
  post_id: number;
  created_at: string;
  display_name?: string;
  username?: string;
  upvotes?: number;
  downvotes?: number;
  score?: number;
}

export interface Vote {
  id: number;
  user_id: number;
  vote_type: number;
  created_at: string;
}

export interface PostVote extends Vote {
  post_id: number;
}

export interface CommentVote extends Vote {
  comment_id: number;
}

// Ensure the database directory exists
// Always try to use persistent storage first, fallback to /tmp only if needed
let dbDir: string;
let dbPath: string;

// Try to use persistent data directory first
const persistentDbDir = path.join(process.cwd(), 'data');
const persistentDbPath = path.join(persistentDbDir, 'ember-forum.db');

try {
  // Try to create persistent directory
  if (!fs.existsSync(persistentDbDir)) {
    fs.mkdirSync(persistentDbDir, { recursive: true });
  }

  // Test if we can write to the persistent directory
  const testFile = path.join(persistentDbDir, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);

  // If we get here, persistent storage works
  dbDir = persistentDbDir;
  dbPath = persistentDbPath;
  console.log('✅ Using persistent storage for database');
} catch (error) {
  // Fallback to /tmp with warning
  console.warn('⚠️  WARNING: Cannot use persistent storage, falling back to ephemeral /tmp');
  console.warn('⚠️  Data will be lost on server restarts!');
  dbDir = '/tmp';
  dbPath = path.join(dbDir, 'ember-forum.db');
}

console.log('Database path:', dbPath);
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        display_name TEXT NOT NULL,
        ip_address TEXT,
        is_banned BOOLEAN DEFAULT FALSE,
        is_muted BOOLEAN DEFAULT FALSE,
        social_credit_score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if social_credit_score column exists, if not add it
    const columnExists = db.prepare(`
      SELECT COUNT(*) as count FROM pragma_table_info('users')
      WHERE name = 'social_credit_score'
    `).get() as { count: number };

    if (columnExists.count === 0) {
      db.exec(`ALTER TABLE users ADD COLUMN social_credit_score INTEGER DEFAULT 0`);
      console.log('Added social_credit_score column to users table');
    }

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Post votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Comment votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS comment_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      comment_id INTEGER NOT NULL,
      vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, comment_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);

  // Initialize default categories
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)');
  const categories = [
    ['Technology', 'Discuss the latest in tech and programming'],
    ['Science', 'Scientific discoveries and discussions'],
    ['Gaming', 'Video games and gaming culture'],
    ['Movies', 'Film discussions and reviews'],
    ['Music', 'All things music'],
    ['Books', 'Literature and reading recommendations'],
    ['Food', 'Cooking, recipes, and food culture'],
    ['Fitness', 'Health and fitness discussions'],
    ['Travel', 'Travel experiences and tips'],
    ['Art', 'Visual arts and creativity'],
    ['Fashion', 'Style and fashion trends'],
    ['DIY & Crafts', 'Do it yourself projects'],
    ['Pets', 'Pet care and cute animal pictures'],
    ['Health', 'Health and wellness discussions'],
    ['Personal Finance', 'Money management and investing'],
    ['Politics', 'Political discussions and news'],
    ['School', 'Education, homework help, and student life']
  ];

  categories.forEach(([name, description]) => {
    insertCategory.run(name, description);
  });

  // Create admin user if it doesn't exist
  const adminUsername = 'Helix_Staff';
  const existingAdmin = getUserByUsername(adminUsername);
  if (!existingAdmin) {
    const adminPassword = 'Helix_Staff_2025_Ember_Supreme!';
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    const stmt = db.prepare('INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)');
    stmt.run(adminUsername, hashedPassword, 'Admin', '127.0.0.1');
    console.log('Admin user created');
  }

  console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// User functions
export function createUser(username: string, password: string, displayName: string, ipAddress: string) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)');
  return stmt.run(username, hashedPassword, displayName, ipAddress);
}

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function updateUserDisplayName(userId: number, displayName: string) {
  const stmt = db.prepare('UPDATE users SET display_name = ? WHERE id = ?');
  return stmt.run(displayName, userId);
}

export function banUser(userId: number) {
  const stmt = db.prepare('UPDATE users SET is_banned = TRUE WHERE id = ?');
  return stmt.run(userId);
}

export function unbanUser(userId: number) {
  const stmt = db.prepare('UPDATE users SET is_banned = FALSE WHERE id = ?');
  return stmt.run(userId);
}

export function muteUser(userId: number) {
  const stmt = db.prepare('UPDATE users SET is_muted = TRUE WHERE id = ?');
  return stmt.run(userId);
}

export function unmuteUser(userId: number) {
  const stmt = db.prepare('UPDATE users SET is_muted = FALSE WHERE id = ?');
  return stmt.run(userId);
}

export function deleteUser(userId: number) {
  try {
    // Start a transaction to ensure all deletions happen atomically
    const transaction = db.transaction(() => {
      // Delete user's votes first (due to foreign key constraints)
      const deletePostVotes = db.prepare('DELETE FROM post_votes WHERE user_id = ?');
      deletePostVotes.run(userId);

      const deleteCommentVotes = db.prepare('DELETE FROM comment_votes WHERE user_id = ?');
      deleteCommentVotes.run(userId);

      // Delete user's comments (this will also delete related comment votes due to CASCADE)
      const deleteComments = db.prepare('DELETE FROM comments WHERE user_id = ?');
      deleteComments.run(userId);

      // Delete user's posts (this will also delete related post votes and comments due to CASCADE)
      const deletePosts = db.prepare('DELETE FROM posts WHERE user_id = ?');
      deletePosts.run(userId);

      // Finally delete the user
      const deleteUserStmt = db.prepare('DELETE FROM users WHERE id = ?');
      return deleteUserStmt.run(userId);
    });

    return transaction();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

export function updateUserSocialCreditScore(userId: number, change: number) {
  const stmt = db.prepare('UPDATE users SET social_credit_score = social_credit_score + ? WHERE id = ?');
  return stmt.run(change, userId);
}

export function getUserSocialCreditScore(userId: number): number {
  const stmt = db.prepare('SELECT social_credit_score FROM users WHERE id = ?');
  const result = stmt.get(userId) as { social_credit_score: number } | undefined;
  return result?.social_credit_score || 0;
}

// Category functions
export function getAllCategories(): Category[] {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return stmt.all() as Category[];
}

export function getCategoryById(id: number) {
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ?');
  return stmt.get(id);
}

// Post functions
export function createPost(title: string, content: string, userId: number, categoryId: number) {
  const stmt = db.prepare('INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)');
  return stmt.run(title, content, userId, categoryId);
}

export function getPostsByCategory(categoryId: number): Post[] {
  const stmt = db.prepare(`
    SELECT p.*, u.display_name, u.username, c.name as category_name,
           COALESCE(SUM(CASE WHEN pv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN pv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(pv.vote_type), 0) as score
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_votes pv ON p.id = pv.post_id
    WHERE p.category_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return stmt.all(categoryId) as Post[];
}

export function getPostById(id: number) {
  const stmt = db.prepare(`
    SELECT p.*, u.display_name, u.username, c.name as category_name,
           COALESCE(SUM(CASE WHEN pv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN pv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(pv.vote_type), 0) as score
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_votes pv ON p.id = pv.post_id
    WHERE p.id = ?
    GROUP BY p.id
  `);
  return stmt.get(id);
}

export function getAllPosts(): Post[] {
  const stmt = db.prepare(`
    SELECT p.*, u.display_name, u.username, c.name as category_name,
           COALESCE(SUM(CASE WHEN pv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN pv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(pv.vote_type), 0) as score
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN post_votes pv ON p.id = pv.post_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);
  return stmt.all() as Post[];
}

export function deletePost(postId: number) {
  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  return stmt.run(postId);
}

// Comment functions
export function createComment(content: string, userId: number, postId: number) {
  const stmt = db.prepare('INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)');
  return stmt.run(content, userId, postId);
}

export function getCommentById(id: number) {
  const stmt = db.prepare(`
    SELECT c.*, u.display_name, u.username,
           COALESCE(SUM(CASE WHEN cv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN cv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(cv.vote_type), 0) as score
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN comment_votes cv ON c.id = cv.comment_id
    WHERE c.id = ?
    GROUP BY c.id
  `);
  return stmt.get(id);
}

export function getCommentsByPost(postId: number) {
  const stmt = db.prepare(`
    SELECT c.*, u.display_name, u.username,
           COALESCE(SUM(CASE WHEN cv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN cv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(cv.vote_type), 0) as score
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN comment_votes cv ON c.id = cv.comment_id
    WHERE c.post_id = ?
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `);
  return stmt.all(postId);
}

export function deleteComment(commentId: number) {
  const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
  return stmt.run(commentId);
}

// Voting functions
export function voteOnPost(userId: number, postId: number, voteType: number) {
  // Get the existing vote to check if we need to reverse it
  const existingVote = getUserPostVote(userId, postId);

  // Get the post owner
  const post = getPostById(postId) as Post;
  if (!post) return null;

  const stmt = db.prepare('INSERT OR REPLACE INTO post_votes (user_id, post_id, vote_type) VALUES (?, ?, ?)');
  const result = stmt.run(userId, postId, voteType);

  // Update social credit score for the post owner
  if (existingVote) {
    // Remove the old vote effect first
    updateUserSocialCreditScore(post.user_id, -existingVote.vote_type);
  }
  // Add the new vote effect
  updateUserSocialCreditScore(post.user_id, voteType);

  return result;
}

export function removePostVote(userId: number, postId: number) {
  // Get the existing vote to reverse the social credit effect
  const existingVote = getUserPostVote(userId, postId);
  const post = getPostById(postId) as Post;

  const stmt = db.prepare('DELETE FROM post_votes WHERE user_id = ? AND post_id = ?');
  const result = stmt.run(userId, postId);

  // Reverse the social credit score effect
  if (existingVote && post) {
    updateUserSocialCreditScore(post.user_id, -existingVote.vote_type);
  }

  return result;
}

export function getPostVotes(postId: number) {
  const stmt = db.prepare(`
    SELECT
      SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END) as downvotes,
      SUM(vote_type) as score
    FROM post_votes
    WHERE post_id = ?
  `);
  return stmt.get(postId);
}

export function getUserPostVote(userId: number, postId: number): { vote_type: number } | undefined {
  const stmt = db.prepare('SELECT vote_type FROM post_votes WHERE user_id = ? AND post_id = ?');
  return stmt.get(userId, postId) as { vote_type: number } | undefined;
}

export function voteOnComment(userId: number, commentId: number, voteType: number) {
  // Get the existing vote to check if we need to reverse it
  const existingVote = getUserCommentVote(userId, commentId);

  // Get the comment owner
  const comment = getCommentById(commentId) as Comment;
  if (!comment) return null;

  const stmt = db.prepare('INSERT OR REPLACE INTO comment_votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)');
  const result = stmt.run(userId, commentId, voteType);

  // Update social credit score for the comment owner
  if (existingVote) {
    // Remove the old vote effect first
    updateUserSocialCreditScore(comment.user_id, -existingVote.vote_type);
  }
  // Add the new vote effect
  updateUserSocialCreditScore(comment.user_id, voteType);

  return result;
}

export function removeCommentVote(userId: number, commentId: number) {
  // Get the existing vote to reverse the social credit effect
  const existingVote = getUserCommentVote(userId, commentId);
  const comment = getCommentById(commentId) as Comment;

  const stmt = db.prepare('DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?');
  const result = stmt.run(userId, commentId);

  // Reverse the social credit score effect
  if (existingVote && comment) {
    updateUserSocialCreditScore(comment.user_id, -existingVote.vote_type);
  }

  return result;
}

export function getCommentVotes(commentId: number) {
  const stmt = db.prepare(`
    SELECT
      SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END) as upvotes,
      SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END) as downvotes,
      SUM(vote_type) as score
    FROM comment_votes
    WHERE comment_id = ?
  `);
  return stmt.get(commentId);
}

export function getUserCommentVote(userId: number, commentId: number): { vote_type: number } | undefined {
  const stmt = db.prepare('SELECT vote_type FROM comment_votes WHERE user_id = ? AND comment_id = ?');
  return stmt.get(userId, commentId) as { vote_type: number } | undefined;
}

// Admin functions for bulk operations
export function deleteAllPosts() {
  const stmt = db.prepare('DELETE FROM posts');
  return stmt.run();
}

export function deleteAllComments() {
  const stmt = db.prepare('DELETE FROM comments');
  return stmt.run();
}

export function deleteAllPostsAndComments() {
  // Delete comments first due to foreign key constraints
  deleteAllComments();
  deleteAllPosts();
}

export function getCommentCount(postId: number): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?');
  const result = stmt.get(postId) as { count: number };
  return result.count;
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword);
}

// Database backup function
export function createDatabaseBackup(): string | null {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(path.dirname(dbPath), 'backups');

    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `ember-forum-backup-${timestamp}.db`);

    // Copy the database file
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`✅ Database backup created: ${backupPath}`);
      return backupPath;
    } else {
      console.log('No database file to backup');
      return null;
    }
  } catch (error) {
    console.error('Failed to create database backup:', error);
    return null;
  }
}

// Enhanced admin functions for bulk operations with backup
export function deleteAllPostsWithBackup() {
  createDatabaseBackup();
  const stmt = db.prepare('DELETE FROM posts');
  return stmt.run();
}

export function deleteAllCommentsWithBackup() {
  createDatabaseBackup();
  const stmt = db.prepare('DELETE FROM comments');
  return stmt.run();
}

export function deleteAllPostsAndCommentsWithBackup() {
  createDatabaseBackup();
  // Delete comments first due to foreign key constraints
  deleteAllComments();
  deleteAllPosts();
}

// Initialize database on import, but with error handling
try {
  // Create a backup on startup if database exists
  if (fs.existsSync(dbPath)) {
    console.log('🔄 Creating startup backup...');
    createDatabaseBackup();
  }

  initializeDatabase();
  console.log('🚀 Database ready and initialized');
} catch (error) {
  console.error('❌ Failed to initialize database on import:', error);
}

export default db;
