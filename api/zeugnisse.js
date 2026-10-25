const crypto=require('crypto');

const cookieName='cfg_docs_auth';
const makeToken=secret=>crypto.createHmac('sha256',secret).update('camilo-documents-access').digest('hex');
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parseCookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const i=v.indexOf('=');return [decodeURIComponent(v.slice(0,i)),decodeURIComponent(v.slice(i+1))]}));

function page(body,title='Zeugnisse & Nachweise'){
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Camilo Fernando Garcia</title><style>
  :root{--bg:#f3eee7;--ink:#171310;--muted:#6e655d;--accent:#b84932;--line:rgba(23,19,16,.16)}
  *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  main{min-height:100vh;display:grid;place-items:center;padding:28px}.card{width:min(680px,100%);border:1px solid var(--line);border-radius:28px;padding:clamp(28px,6vw,56px);background:rgba(255,255,255,.28)}
  .eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:.7rem;font-weight:850;color:var(--accent);margin:0 0 18px}h1{font-size:clamp(2.8rem,7vw,5rem);line-height:.9;letter-spacing:-.065em;margin:0 0 22px}p{color:var(--muted);line-height:1.7}
  form{margin-top:28px;display:grid;gap:12px}label{font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em}input{width:100%;min-height:52px;border:1px solid var(--line);border-radius:14px;padding:0 16px;background:#fff;font:inherit}
  button,.button{min-height:50px;border:0;border-radius:999px;padding:0 22px;background:var(--ink);color:#fff;font-weight:800;font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
  .back{display:inline-block;margin-top:24px;color:var(--muted);font-size:.82rem;text-decoration:none}.error{color:#9b2f20;font-weight:700}.docbox{margin-top:30px;padding:22px;border:1px dashed var(--line);border-radius:18px;color:var(--muted)}
  </style></head><body><main><section class="card">${body}</section></main></body></html>`;
}

module.exports=async(req,res)=>{
  const secret=process.env.DOCS_PASSWORD;
  if(!secret){res.status(500).send(page('<p class="eyebrow">Dokumente</p><h1>Bereich nicht verfügbar.</h1><p>Die Zugangskonfiguration fehlt.</p>'));return}

  if(req.method==='POST'){
    let password='';
    if(typeof req.body==='string'){
      password=new URLSearchParams(req.body).get('password')||'';
    }else if(req.body&&typeof req.body==='object'){
      password=req.body.password||'';
    }
    if(password===secret){
      res.setHeader('Set-Cookie',`${cookieName}=${makeToken(secret)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=14400`);
      res.statusCode=303;res.setHeader('Location','/api/zeugnisse');res.end();return;
    }
    res.status(401).send(page('<p class="eyebrow">Geschützter Bereich</p><h1>Zeugnisse & Nachweise.</h1><p class="error">Das Passwort ist nicht korrekt.</p><form method="post"><label for="password">Passwort</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">Zugang öffnen</button></form><a class="back" href="/">← Zurück zum Portfolio</a>'));
    return;
  }

  const cookies=parseCookies(req);
  const valid=cookies[cookieName]===makeToken(secret);
  if(!valid){
    res.status(200).send(page('<p class="eyebrow">Geschützter Bereich</p><h1>Zeugnisse & Nachweise.</h1><p>Dieser Bereich enthält persönliche Unterlagen und ist deshalb nicht öffentlich zugänglich.</p><form method="post"><label for="password">Passwort</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">Zugang öffnen</button></form><a class="back" href="/">← Zurück zum Portfolio</a>'));
    return;
  }

  res.status(200).send(page('<p class="eyebrow">Zugang freigeschaltet</p><h1>Zeugnisse & Nachweise.</h1><p>Der geschützte Bereich ist aktiv. Die Zeugnis-PDFs werden hier hinterlegt und sind dann nur nach erfolgreicher Passworteingabe zugänglich.</p><div class="docbox">Noch keine Zeugnis-PDFs hinterlegt.</div><a class="back" href="/">← Zurück zum Portfolio</a>'));
};