exports.id=529,exports.ids=[529,710],exports.modules={2909:(e,E,t)=>{"use strict";t.d(E,{EB:()=>T,Ey:()=>u,HW:()=>c,Tf:()=>N,rL:()=>p});var r=t(3205),s=t.n(r),n=t(4999),i=t(6710);let a=process.env.JWT_SECRET||"ember-forum-secret-key-2025",o="Helix_Staff";function u(e){let E=e.username===o;return s().sign({id:e.id,username:e.username,displayName:e.display_name,isAdmin:E,isBanned:e.is_banned,isMuted:e.is_muted},a,{expiresIn:"7d"})}function d(e){try{let E=s().verify(e,a);return{id:E.id,username:E.username,displayName:E.displayName,isAdmin:E.isAdmin,isBanned:E.isBanned,isMuted:E.isMuted}}catch{return null}}async function c(){try{let e=await (0,n.UL)(),E=e.get("auth-token")?.value;if(!E)return null;let t=d(E);if(!t)return null;let r=(0,i.kl)(t.id);if(!r)return null;return{id:r.id,username:r.username,displayName:r.display_name,isAdmin:t.isAdmin,isBanned:r.is_banned,isMuted:r.is_muted}}catch{return null}}async function p(e){try{let E=e.cookies.get("auth-token")?.value;if(!E)return null;let t=d(E);if(!t)return null;let r=(0,i.kl)(t.id);if(!r)return null;return{id:r.id,username:r.username,displayName:r.display_name,isAdmin:t.isAdmin,isBanned:r.is_banned,isMuted:r.is_muted}}catch{return null}}function T(e,E){return e===o&&"Helix_Staff_2025_Ember_Supreme!"===E}function N(e){let E=e.headers.get("x-forwarded-for"),t=e.headers.get("x-real-ip");return E?E.split(",")[0].trim():t||"127.0.0.1"}},6487:()=>{},6710:(e,E,t)=>{"use strict";t.d(E,{Ay:()=>J,BE:()=>X,CF:()=>A,G2:()=>R,JE:()=>N,KF:()=>G,L6:()=>x,Tu:()=>H,UO:()=>h,X3:()=>l,X7:()=>B,b2:()=>m,bG:()=>U,bf:()=>P,eT:()=>F,getAllCategories:()=>I,hG:()=>L,k9:()=>D,kg:()=>T,kl:()=>_,oe:()=>Y,pD:()=>v,qC:()=>O,qy:()=>b,tY:()=>y,tj:()=>w,v:()=>W,wG:()=>g,wn:()=>S,ys:()=>M,zX:()=>f});var r=t(7550),s=t.n(r),n=t(5663),i=t(3873),a=t.n(i),o=t(9021),u=t.n(o);let d=a().join(process.cwd(),"data"),c=a().join(d,"ember-forum.db");u().existsSync(d)||u().mkdirSync(d,{recursive:!0}),console.log("Database path:",c);let p=new(s())(c);function T(e,E,t,r){let s=n.Ay.hashSync(E,10);return p.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(e,s,t,r)}function N(e){return p.prepare("SELECT * FROM users WHERE username = ?").get(e)}function _(e){return p.prepare("SELECT * FROM users WHERE id = ?").get(e)}function R(e,E){return p.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(E,e)}function l(e){return p.prepare("UPDATE users SET is_banned = TRUE WHERE id = ?").run(e)}function S(e){return p.prepare("UPDATE users SET is_banned = FALSE WHERE id = ?").run(e)}function m(e){return p.prepare("UPDATE users SET is_muted = TRUE WHERE id = ?").run(e)}function O(e){return p.prepare("UPDATE users SET is_muted = FALSE WHERE id = ?").run(e)}function L(e){return p.prepare("DELETE FROM users WHERE id = ?").run(e)}function A(){return p.prepare("SELECT * FROM users ORDER BY created_at DESC").all()}function C(e,E){return p.prepare("UPDATE users SET social_credit_score = social_credit_score + ? WHERE id = ?").run(E,e)}function I(){return p.prepare("SELECT * FROM categories ORDER BY name").all()}function v(e,E,t,r){return p.prepare("INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)").run(e,E,t,r)}function U(e){return p.prepare(`
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
  `).all(e)}function y(e){return p.prepare(`
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
  `).get(e)}function f(){return p.prepare(`
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
  `).all()}function M(e){return p.prepare("DELETE FROM posts WHERE id = ?").run(e)}function F(e,E,t){return p.prepare("INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)").run(e,E,t)}function D(e){return p.prepare(`
    SELECT c.*, u.display_name, u.username,
           COALESCE(SUM(CASE WHEN cv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN cv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(cv.vote_type), 0) as score
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN comment_votes cv ON c.id = cv.comment_id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(e)}function g(e){return p.prepare(`
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
  `).all(e)}function H(e){return p.prepare("DELETE FROM comments WHERE id = ?").run(e)}function G(e,E,t){let r=Y(e,E),s=y(E);if(!s)return null;let n=p.prepare("INSERT OR REPLACE INTO post_votes (user_id, post_id, vote_type) VALUES (?, ?, ?)").run(e,E,t);return r&&C(s.user_id,-r.vote_type),C(s.user_id,t),n}function W(e,E){let t=Y(e,E),r=y(E),s=p.prepare("DELETE FROM post_votes WHERE user_id = ? AND post_id = ?").run(e,E);return t&&r&&C(r.user_id,-t.vote_type),s}function Y(e,E){return p.prepare("SELECT vote_type FROM post_votes WHERE user_id = ? AND post_id = ?").get(e,E)}function P(e,E,t){let r=B(e,E),s=D(E);if(!s)return null;let n=p.prepare("INSERT OR REPLACE INTO comment_votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)").run(e,E,t);return r&&C(s.user_id,-r.vote_type),C(s.user_id,t),n}function h(e,E){let t=B(e,E),r=D(E),s=p.prepare("DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?").run(e,E);return t&&r&&C(r.user_id,-t.vote_type),s}function B(e,E){return p.prepare("SELECT vote_type FROM comment_votes WHERE user_id = ? AND comment_id = ?").get(e,E)}function b(){return p.prepare("DELETE FROM posts").run()}function w(){return p.prepare("DELETE FROM comments").run()}function x(){w(),b()}function X(e,E){return n.Ay.compareSync(e,E)}p.pragma("foreign_keys = ON");try{!function(){try{console.log("Initializing database..."),p.exec(`
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
    `);let e=p.prepare(`
      SELECT COUNT(*) as count FROM pragma_table_info('users')
      WHERE name = 'social_credit_score'
    `).get();0===e.count&&(p.exec("ALTER TABLE users ADD COLUMN social_credit_score INTEGER DEFAULT 0"),console.log("Added social_credit_score column to users table")),p.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `),p.exec(`
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
  `),p.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `),p.exec(`
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
  `),p.exec(`
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
  `);let E=p.prepare("INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)");[["Technology","Discuss the latest in tech and programming"],["Science","Scientific discoveries and discussions"],["Gaming","Video games and gaming culture"],["Movies","Film discussions and reviews"],["Music","All things music"],["Books","Literature and reading recommendations"],["Food","Cooking, recipes, and food culture"],["Fitness","Health and fitness discussions"],["Travel","Travel experiences and tips"],["Art","Visual arts and creativity"],["Fashion","Style and fashion trends"],["DIY & Crafts","Do it yourself projects"],["Pets","Pet care and cute animal pictures"],["Health","Health and wellness discussions"],["Personal Finance","Money management and investing"],["Politics","Political discussions and news"],["School","Education, homework help, and student life"]].forEach(([e,t])=>{E.run(e,t)});let t="Helix_Staff";if(!N(t)){let e=n.Ay.hashSync("Helix_Staff_2025_Ember_Supreme!",10);p.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(t,e,"Admin","127.0.0.1"),console.log("Admin user created")}console.log("Database initialized successfully")}catch(e){throw console.error("Database initialization failed:",e),e}}()}catch(e){console.error("Failed to initialize database on import:",e)}let J=p},8335:()=>{}};