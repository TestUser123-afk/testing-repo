(()=>{var e={};e.id=389,e.ids=[389,710],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3873:e=>{"use strict";e.exports=require("path")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5511:e=>{"use strict";e.exports=require("crypto")},6487:()=>{},6710:(e,t,r)=>{"use strict";r.d(t,{Ay:()=>k,BE:()=>X,CF:()=>m,G2:()=>_,JE:()=>N,KF:()=>G,L6:()=>b,Tu:()=>H,UO:()=>h,X3:()=>S,X7:()=>W,b2:()=>L,bG:()=>U,bf:()=>Y,eT:()=>D,getAllCategories:()=>I,hG:()=>l,k9:()=>f,kg:()=>T,kl:()=>R,oe:()=>P,pD:()=>C,qC:()=>A,qy:()=>w,tY:()=>y,tj:()=>B,v:()=>x,wG:()=>g,wn:()=>O,ys:()=>M,zX:()=>F});var E=r(7550),s=r.n(E),n=r(5663),o=r(3873),i=r.n(o),a=r(9021),u=r.n(a);let p=i().join(process.cwd(),"data"),c=i().join(p,"ember-forum.db");u().existsSync(p)||u().mkdirSync(p,{recursive:!0}),console.log("Database path:",c);let d=new(s())(c);function T(e,t,r,E){let s=n.Ay.hashSync(t,10);return d.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(e,s,r,E)}function N(e){return d.prepare("SELECT * FROM users WHERE username = ?").get(e)}function R(e){return d.prepare("SELECT * FROM users WHERE id = ?").get(e)}function _(e,t){return d.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(t,e)}function S(e){return d.prepare("UPDATE users SET is_banned = TRUE WHERE id = ?").run(e)}function O(e){return d.prepare("UPDATE users SET is_banned = FALSE WHERE id = ?").run(e)}function L(e){return d.prepare("UPDATE users SET is_muted = TRUE WHERE id = ?").run(e)}function A(e){return d.prepare("UPDATE users SET is_muted = FALSE WHERE id = ?").run(e)}function l(e){return d.prepare("DELETE FROM users WHERE id = ?").run(e)}function m(){return d.prepare("SELECT * FROM users ORDER BY created_at DESC").all()}function v(e,t){return d.prepare("UPDATE users SET social_credit_score = social_credit_score + ? WHERE id = ?").run(t,e)}function I(){return d.prepare("SELECT * FROM categories ORDER BY name").all()}function C(e,t,r,E){return d.prepare("INSERT INTO posts (title, content, user_id, category_id) VALUES (?, ?, ?, ?)").run(e,t,r,E)}function U(e){return d.prepare(`
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
  `).all(e)}function y(e){return d.prepare(`
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
  `).get(e)}function F(){return d.prepare(`
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
  `).all()}function M(e){return d.prepare("DELETE FROM posts WHERE id = ?").run(e)}function D(e,t,r){return d.prepare("INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)").run(e,t,r)}function f(e){return d.prepare(`
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
  `).all(e)}function H(e){return d.prepare("DELETE FROM comments WHERE id = ?").run(e)}function G(e,t,r){let E=P(e,t),s=y(t);if(!s)return null;let n=d.prepare("INSERT OR REPLACE INTO post_votes (user_id, post_id, vote_type) VALUES (?, ?, ?)").run(e,t,r);return E&&v(s.user_id,-E.vote_type),v(s.user_id,r),n}function x(e,t){let r=P(e,t),E=y(t),s=d.prepare("DELETE FROM post_votes WHERE user_id = ? AND post_id = ?").run(e,t);return r&&E&&v(E.user_id,-r.vote_type),s}function P(e,t){return d.prepare("SELECT vote_type FROM post_votes WHERE user_id = ? AND post_id = ?").get(e,t)}function Y(e,t,r){let E=W(e,t),s=f(t);if(!s)return null;let n=d.prepare("INSERT OR REPLACE INTO comment_votes (user_id, comment_id, vote_type) VALUES (?, ?, ?)").run(e,t,r);return E&&v(s.user_id,-E.vote_type),v(s.user_id,r),n}function h(e,t){let r=W(e,t),E=f(t),s=d.prepare("DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?").run(e,t);return r&&E&&v(E.user_id,-r.vote_type),s}function W(e,t){return d.prepare("SELECT vote_type FROM comment_votes WHERE user_id = ? AND comment_id = ?").get(e,t)}function w(){return d.prepare("DELETE FROM posts").run()}function B(){return d.prepare("DELETE FROM comments").run()}function b(){B(),w()}function X(e,t){return n.Ay.compareSync(e,t)}d.pragma("foreign_keys = ON");try{!function(){try{console.log("Initializing database..."),d.exec(`
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
  `);let t=d.prepare("INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)");[["Technology","Discuss the latest in tech and programming"],["Science","Scientific discoveries and discussions"],["Gaming","Video games and gaming culture"],["Movies","Film discussions and reviews"],["Music","All things music"],["Books","Literature and reading recommendations"],["Food","Cooking, recipes, and food culture"],["Fitness","Health and fitness discussions"],["Travel","Travel experiences and tips"],["Art","Visual arts and creativity"],["Fashion","Style and fashion trends"],["DIY & Crafts","Do it yourself projects"],["Pets","Pet care and cute animal pictures"],["Health","Health and wellness discussions"],["Personal Finance","Money management and investing"],["Politics","Political discussions and news"],["School","Education, homework help, and student life"]].forEach(([e,r])=>{t.run(e,r)});let r="Helix_Staff";if(!N(r)){let e=n.Ay.hashSync("Helix_Staff_2025_Ember_Supreme!",10);d.prepare("INSERT INTO users (username, password, display_name, ip_address) VALUES (?, ?, ?, ?)").run(r,e,"Admin","127.0.0.1"),console.log("Admin user created")}console.log("Database initialized successfully")}catch(e){throw console.error("Database initialization failed:",e),e}}()}catch(e){console.error("Failed to initialize database on import:",e)}let k=d},7550:e=>{"use strict";e.exports=require("better-sqlite3")},8335:()=>{},9021:e=>{"use strict";e.exports=require("fs")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9489:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>N,routeModule:()=>p,serverHooks:()=>T,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>d});var E={};r.r(E),r.d(E,{GET:()=>u});var s=r(6559),n=r(8088),o=r(7719),i=r(2190),a=r(6710);async function u(e,{params:t}){try{let{id:e}=await t,r=parseInt(e);if(isNaN(r))return i.NextResponse.json({error:"Invalid post ID"},{status:400});let E=(0,a.wG)(r);return i.NextResponse.json(E)}catch(e){return console.error("Get comments error:",e),i.NextResponse.json({error:"Internal server error"},{status:500})}}let p=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/comments/post/[id]/route",pathname:"/api/comments/post/[id]",filename:"route",bundlePath:"app/api/comments/post/[id]/route"},resolvedPagePath:"/workspaces/testing-repo/src/app/api/comments/post/[id]/route.ts",nextConfigOutput:"",userland:E}),{workAsyncStorage:c,workUnitAsyncStorage:d,serverHooks:T}=p;function N(){return(0,o.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:d})}}};var t=require("../../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),E=t.X(0,[447,580,44],()=>r(9489));module.exports=E})();