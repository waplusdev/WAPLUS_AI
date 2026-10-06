const normalize = jid => String(jid||'').split('@')[0].split(':')[0].replace(/\D/g,'');
const toJid = num => `${normalize(num)}@s.whatsapp.net`;

async function groupState(sock, message) {
  if (!message?.isGroup) return { isAdmin:false, isBotAdmin:false, metadata:null, participants:[] };
  try {
    const metadata = await sock.groupMetadata(message.chat);
    const list = metadata?.participants || [];
    const me = normalize(sock.user?.id);
    const sender = normalize(message.sender || message.key?.participant || message.participant);
    const admin = p => ['admin','superadmin'].includes(p?.admin);
    return {
      metadata,
      participants: list,
      isAdmin: list.some(p => normalize(p.id)===sender && admin(p)),
      isBotAdmin: list.some(p => normalize(p.id)===me && admin(p)),
      adminList: list.filter(admin).map(p=>p.id)
    };
  } catch {
    return { isAdmin:false, isBotAdmin:false, metadata:null, participants:[] };
  }
}

function guard(ctx, kind) {
  if (kind==='owner' &&!ctx.isOwner) return '*┌─ ✦ DENIED ✦*\n└─ _⛔ Owner only._';
  if (kind==='admin' &&!ctx.isAdmin) return '*┌─ ✦ DENIED ✦*\n└─ _⛔ Group admin only._';
  if (kind==='botAdmin' &&!ctx.isBotAdmin) return '*┌─ ✦ DENIED ✦*\n└─ _🤖 Bot must be admin._';
  if (kind==='group' &&!ctx.isGroup) return '*┌─ ✦ DENIED ✦*\n└─ _👥 Groups only._';
  if (kind==='private' && ctx.isGroup) return '*┌─ ✦ DENIED ✦*\n└─ _💬 Private only._';
  return null;
}

// › helpers used across commands
const isOwner = (sender, ownerList) => {
  const s = normalize(sender);
  return (ownerList||[]).some(o => normalize(o)===s);
};

const isAdmin = async (sock, chat, user) => {
  const meta = await sock.groupMetadata(chat).catch(()=>null);
  const n = normalize(user);
  return meta?.participants?.some(p=>normalize(p.id)===n && ['admin','superadmin'].includes(p.admin));
};

function requireGroup(msg) { if(!msg.isGroup) throw new Error('GROUP_ONLY'); }
async function requireAdmin(sock, msg) {
  const st = await groupState(sock, msg);
  if(!st.isAdmin) throw new Error('ADMIN_ONLY');
  return st;
}

module.exports = {
  normalize, toJid,
  groupState,
  guard,
  isOwner, isAdmin,
  requireGroup, requireAdmin
};