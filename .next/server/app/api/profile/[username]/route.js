(()=>{var e={};e.id=252,e.ids=[252,710],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5224:(e,r,t)=>{"use strict";t.r(r),t.d(r,{patchFetch:()=>N,routeModule:()=>p,serverHooks:()=>T,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>d});var E={};t.r(E),t.d(E,{GET:()=>u});var s=t(6559),n=t(8088),o=t(7719),i=t(2190),a=t(6710);async function u(e,{params:r}){try{let{username:e}=await r;if(!e)return i.NextResponse.json({error:"Username is required"},{status:400});let t=(0,a.JE)(e);if(!t)return i.NextResponse.json({error:"User not found"},{status:404});return i.NextResponse.json({social_credit_score:t.social_credit_score,created_at:t.created_at})}catch(e){return console.error("Failed to fetch user profile:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}let p=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/profile/[username]/route",pathname:"/api/profile/[username]",filename:"route",bundlePath:"app/api/profile/[username]/route"},resolvedPagePath:"/workspaces/testing-repo/src/app/api/profile/[username]/route.ts",nextConfigOutput:"",userland:E}),{workAsyncStorage:c,workUnitAsyncStorage:d,serverHooks:T}=p;function N(){return(0,o.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:d})}},5511:e=>{"use strict";e.exports=require("crypto")},6487:()=>{},6710:(e,r,t)=>{"use strict";t.d(r,{Ay:()=>k,BE:()=>X,CF:()=>m,G2:()=>R,JE:()=>N,KF:()=>G,L6:()=>b,Tu:()=>H,UO:()=>Y,X3:()=>S,X7:()=>W,b2:()=>l,bG:()=>U,bf:()=>h,eT:()=>M,getAllCategories:()=>C,hG:()=>A,k9:()=>D,kg:()=>T,kl:()=>_,oe:()=>P,pD:()=>I,qC:()=>L,qy:()=>w,tY:()=>f,tj:()=>B,v:()=>x,wG:()=>g,wn:()=>O,ys:()=>F,zX:()=>y});var E=t(7550),s=t.n(E),n=t(5663),o=t(3873),i=t.n(o),a=t(9021),u=t.n(a);let p=i().join(process.cwd(),"data"),c=i().join(p,"ember-forum.db");u().existsSync(p)||u().mkdirSync(p,{recursive:!0}),console.log("Database path:",c);let d=new(s())(c);function T(e,r,t,E){let s=n.Ay.hashSync(r,10);return d.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(e,s,t,E)}function N(e){return d.prepare("SELECT * FROM users WHERE username = ?").get(e)}function _(e){return d.prepare("SELECT * FROM users WHERE id = ?").get(e)}function R(e,r){return d.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(r,e)}function S(e){return d.prepare("UPDATE users SET is_banned = TRUE WHERE id = ?").run(e)}function O(e){return d.prepare("UPDATE users SET is_banned = FALSE WHERE id = ?").run(e)}function l(e){return d.prepare("UPDATE users SET is_muted = TRUE WHERE id = ?").run(e)}function L(e){return d.prepare("UPDATE users SET is_muted = FALSE WHERE id = ?").run(e)}function A(e){return d.prepare("DELETE FROM users WHERE id = ?").run(e)}function m(){return d.prepare("SELECT * FROM users ORDER BY created_at DESC").all()}function v(e,r){return d.prepare("UPDATE users SET social_credit_score = social_credit_score + ? WHERE id = ?").run(r,e)}function C(){return d.prepare("SELECT * FROM categories ORDER BY name").all()}function I(e,r,t,E){return d.prepare("INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)").run(e,r,t,E)}function U(e){return d.prepare(`
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
  `).all(e)}function f(e){return d.prepare(`
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
  `).get(e)}function y(){return d.prepare(`
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
  `).all()}function F(e){return d.prepare("DELETE FROM posts WHERE id = ?").run(e)}function M(e,r,t){return d.prepare("INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)").run(e,r,t)}function D(e){return d.prepare(`
    SELECT c.*, u.display_name, u.username,
           COALESCE(SUM(CASE WHEN cv.vote_type = 1 THEN 1 ELSE 0 END), 0) as upvotes,
           COALESCE(SUM(CASE WHEN cv.vote_type = -1 THEN 1 ELSE 0 END), 0) as downvotes,
           COALESCE(SUM(cv.vote_type), 0) as score
    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN comment_votes cv ON c.id = cv.comment_id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(e)}function g(e){return d.prepare(`
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
  `).all(e)}function H(e){return d.prepare("DELETE FROM comments WHERE id = ?").run(e)}function G(e,r,t){let E=P(e,r),s=f(r);if(!s)return null;let n=d.prepare("INSERT OR REPLACE INTO post_votes (user_id, post_id, vote_type) VALUES (?, ?, ?)").run(e,r,t);return E&&v(s.user_id,-E.vote_type),v(s.user_id,t),n}function x(e,r){let t=P(e,r),E=f(r),s=d.prepare("DELETE FROM post_votes WHERE user_id = ? AND post_id = ?").run(e,r);return t&&E&&v(E.user_id,-t.vote_type),s}function P(e,r){return d.prepare("SELECT vote_type FROM post_votes WHERE user_id = ? AND post_id = ?").get(e,r)}function h(e,r,t){let E=W(e,r),s=D(r);if(!s)return null;let n=d.prepare("INSERT OR REPLACE INTO comment_votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)").run(e,r,t);return E&&v(s.user_id,-E.vote_type),v(s.user_id,t),n}function Y(e,r){let t=W(e,r),E=D(r),s=d.prepare("DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?").run(e,r);return t&&E&&v(E.user_id,-t.vote_type),s}function W(e,r){return d.prepare("SELECT vote_type FROM comment_votes WHERE user_id = ? AND comment_id = ?").get(e,r)}function w(){return d.prepare("DELETE FROM posts").run()}function B(){return d.prepare("DELETE FROM comments").run()}function b(){B(),w()}function X(e,r){return n.Ay.compareSync(e,r)}d.pragma("foreign_keys = ON");try{!function(){try{console.log("Initializing database..."),d.exec(`
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
    `);let e=d.prepare(`
      SELECT COUNT(*) as count FROM pragma_table_info('users')
      WHERE name = 'social_credit_score'
    `).get();0===e.count&&(d.exec("ALTER TABLE users ADD COLUMN social_credit_score INTEGER DEFAULT 0"),console.log("Added social_credit_score column to users table")),d.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `),d.exec(`
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
  `),d.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )
  `),d.exec(`
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
  `),d.exec(`
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
  `);let r=d.prepare("INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)");[["Technology","Discuss the latest in tech and programming"],["Science","Scientific discoveries and discussions"],["Gaming","Video games and gaming culture"],["Movies","Film discussions and reviews"],["Music","All things music"],["Books","Literature and reading recommendations"],["Food","Cooking, recipes, and food culture"],["Fitness","Health and fitness discussions"],["Travel","Travel experiences and tips"],["Art","Visual arts and creativity"],["Fashion","Style and fashion trends"],["DIY & Crafts","Do it yourself projects"],["Pets","Pet care and cute animal pictures"],["Health","Health and wellness discussions"],["Personal Finance","Money management and investing"],["Politics","Political discussions and news"],["School","Education, homework help, and student life"]].forEach(([e,t])=>{r.run(e,t)});let t="Helix_Staff";if(!N(t)){let e=n.Ay.hashSync("Helix_Staff_2025_Ember_Supreme!",10);d.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(t,e,"Admin","127.0.0.1"),console.log("Admin user created")}console.log("Database initialized successfully")}catch(e){throw console.error("Database initialization failed:",e),e}}()}catch(e){console.error("Failed to initialize database on import:",e)}let k=d},7550:e=>{"use strict";e.exports=require("better-sqlite3")},8335:()=>{},9021:e=>{"use strict";e.exports=require("fs")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),E=r.X(0,[447,580,44],()=>t(5224));module.exports=E})();