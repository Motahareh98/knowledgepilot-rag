import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const app=express(); app.use(cors()); app.use(express.json({limit:'5mb'}));
const rawAI=(process.env.AI_URL||'http://localhost:8000').replace(/\/$/,'');
const AI_URL=/^https?:\/\//.test(rawAI)?rawAI:`http://${rawAI}`;
const __dirname=path.dirname(fileURLToPath(import.meta.url));

let dbReady=false;
if(process.env.MONGO_URI){
  try{await mongoose.connect(process.env.MONGO_URI);dbReady=true;console.log('MongoDB connected')}
  catch(e){console.warn('Mongo unavailable, using demo memory store:',e.message)}
}else console.log('MONGO_URI not set; using demo memory store');

const Doc=mongoose.model('Document',new mongoose.Schema({title:String,text:String,chunkCount:Number,createdAt:{type:Date,default:Date.now}}));
const Conversation=mongoose.model('Conversation',new mongoose.Schema({question:String,answer:String,citations:Array,createdAt:{type:Date,default:Date.now}}));
const memoryDocs=[]; const memoryConversations=[];

app.get('/api/health',(q,s)=>s.json({ok:true,service:'knowledgepilot-api',storage:dbReady?'mongodb':'memory'}));

app.post('/api/documents',async(req,res)=>{
  try{
    const draft={title:req.body.title||'Untitled',text:req.body.text||'',createdAt:new Date().toISOString()};
    if(!draft.text.trim()) return res.status(400).json({error:'Document text is required'});
    let doc;
    if(dbReady) doc=await Doc.create(draft);
    else doc={...draft,_id:crypto.randomUUID(),chunkCount:0};

    const r=await fetch(`${AI_URL}/ingest`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({document_id:String(doc._id),title:doc.title,text:doc.text})});
    const a=await r.json();
    if(!r.ok) throw new Error(a.detail||'AI ingestion failed');
    doc.chunkCount=a.chunks||0;
    if(dbReady) await doc.save(); else memoryDocs.unshift(doc);
    res.status(201).json(doc);
  }catch(e){res.status(502).json({error:e.message})}
});

app.get('/api/documents',async(q,s)=>s.json(dbReady?await Doc.find().select('-text').sort({createdAt:-1}).limit(20):memoryDocs.map(({text,...d})=>d).slice(0,20)));

app.post('/api/ask',async(req,res)=>{
  try{
    const r=await fetch(`${AI_URL}/query`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:req.body.question,top_k:req.body.top_k||4})});
    const a=await r.json();
    if(!r.ok) throw new Error(a.detail||'AI query failed');
    const c={_id:crypto.randomUUID(),question:req.body.question,answer:a.answer,citations:a.citations,createdAt:new Date().toISOString()};
    if(dbReady) await Conversation.create(c); else memoryConversations.unshift(c);
    res.json(a);
  }catch(e){res.status(502).json({error:e.message})}
});

app.get('/api/conversations',async(q,s)=>s.json(dbReady?await Conversation.find().sort({createdAt:-1}).limit(10):memoryConversations.slice(0,10)));

async function rebuildVectorIndex(){
  if(!dbReady) return;
  try{
    const docs=await Doc.find();
    for(const d of docs) await fetch(`${AI_URL}/ingest`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({document_id:String(d._id),title:d.title,text:d.text})});
    if(docs.length) console.log(`Re-indexed ${docs.length} documents into AI service`);
  }catch(e){console.warn('Vector re-index skipped:',e.message)}
}
await rebuildVectorIndex();

const clientDist=path.resolve(__dirname,'../../client/dist');
app.use(express.static(clientDist));
app.use((req,res,next)=>{
  if(req.method==='GET'&&!req.path.startsWith('/api/')) return res.sendFile(path.join(clientDist,'index.html'));
  next();
});

app.listen(process.env.PORT||5000,'0.0.0.0',()=>console.log('KnowledgePilot web app running'));
