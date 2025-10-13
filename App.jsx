import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Button from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { signInWithGoogle, auth, signOutUser } from './firebase';

// --- CONFIG ---
// Set this to your deployed Google Apps Script Web App URL (see README for script)
const GAS_ENDPOINT = "REPLACE_WITH_YOUR_GAS_WEBAPP_URL";

export default function App(){
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(()=> {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return () => unsub();
  },[]);

  async function saveJournal(){
    if(!journalText.trim()) return alert('Tulis jurnal dahulu.');
    // POST to GAS endpoint; GAS should append to Google Sheet
    try{
      const res = await fetch(GAS_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          action: 'append',
          timestamp: new Date().toLocaleString(),
          user: user ? user.displayName : 'Anon',
          text: journalText
        })
      });
      const j = await res.json();
      if(j.success){
        alert('Jurnal tersimpan.');
        setJournalText('');
        loadEntries();
      } else {
        alert('Gagal menyimpan: ' + (j.message || 'unknown'));
      }
    }catch(err){
      console.error(err);
      alert('Gagal mengirim ke server.');
    }
  }

  async function loadEntries(){
    try{
      const res = await fetch(GAS_ENDPOINT + '?action=list');
      const j = await res.json();
      setEntries(j.entries || []);
    }catch(e){
      console.error(e);
    }
  }

  useEffect(()=>{ loadEntries(); },[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex flex-col items-center p-6">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <img src="/logo-sman1tibawa.png" alt="Logo" className="mx-auto w-32"/>
          <h1 className="text-3xl font-bold text-blue-700">Belajar Tangguh - SMAN 1 Tibawa</h1>
          <p className="text-gray-600">Portal pembelajaran resiliensi</p>
          <div className="mt-3">
            {user ? (
              <div className="flex items-center justify-center gap-3">
                <img src={user.photoURL} alt="u" className="w-8 h-8 rounded-full"/>
                <div className="text-sm">{user.displayName}</div>
                <Button className="bg-red-500" onClick={async ()=>{ await signOutUser(); }}>Logout</Button>
              </div>
            ) : (
              <Button className="bg-blue-600" onClick={async ()=>{ try{ await signInWithGoogle(); } catch(e){ console.error(e); alert('Login gagal'); }}}>Masuk dengan Google</Button>
            )}
          </div>
        </div>

        {page === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <CardContent>
                <h3 className="font-semibold text-lg">Jurnal Diri</h3>
                <p className="text-sm text-gray-600">Tulis pengalaman dan perasaanmu hari ini.</p>
                <textarea value={journalText} onChange={(e)=>setJournalText(e.target.value)} className="w-full mt-2 p-2 border rounded" rows={6}></textarea>
                <div className="mt-2 flex gap-2">
                  <Button className="bg-green-500" onClick={saveJournal}>Simpan Jurnal</Button>
                  <Button onClick={()=>setPage('challenge')}>Zona Tantangan</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent>
                <h3 className="font-semibold text-lg">Riwayat Jurnal</h3>
                <div className="mt-3 max-h-64 overflow-auto space-y-3">
                  {entries.length===0 && <div className="text-sm text-gray-500">Belum ada entri.</div>}
                  {entries.map((e, i)=>(
                    <div key={i} className="p-2 border rounded">
                      <div className="text-xs text-gray-500">{e.timestamp} • {e.user}</div>
                      <div className="mt-1 text-sm">{e.text}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Button onClick={loadEntries}>Refresh</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {page === 'challenge' && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Zona Tantangan</h2>
            <div className="grid gap-3">
              <Card><CardContent>
                <h4 className="font-bold">Tantangan: Menghibur Teman</h4>
                <p className="text-sm text-gray-600">Tawarkan waktu dan kata-kata hangat. Setelah selesai, tuliskan refleksi di jurnal.</p>
              </CardContent></Card>
              <Button onClick={()=>setPage('home')}>Kembali</Button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
