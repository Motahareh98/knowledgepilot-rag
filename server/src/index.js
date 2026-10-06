import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import mongoose from 'mongoose';
const app=express(); app.use(cors()); app.use(express.json({limit:'5mb'}));
const AI_URL=process.env.AI_URL||'http://localhost:8000';
await mongoose.connect(process.env.MONGO_URI||'mongodb://127.0.0.1:27017/knowledgepilot').catch(e=>console.warn(e.message));
const Doc=mongoose.model('Document',new mongoose.Schema({title:String,text:String,chunkCount:Number,createdAt:{type:Date,default:Date.now}}));
const Conversation=mongoose.model('Conversation',new mongoose.Schema({question:String,answer:String,citations:Array,createdAt:{type:Date,default:Date.now}}));
app.get('/api/health',(q,s)=>s.json({ok:true,service:'knowledgepilot-api'}));
app.post('/api/documents',async(req,res)=>{try{const doc=await Doc.create({title:req.body.title||'Untitled',text:req.body.text});const r=await fetch(`${AI_URL}/ingest`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({document_id:String(doc._id),title:doc.title,text:doc.text})});const a=await r.json();doc.chunkCount=a.chunks||0;await doc.save();res.status(201).json(doc)}catch(e){res.status(502).json({error:e.message})}});
app.get('/api/documents',async(q,s)=>s.json(await Doc.find().select('-text').sort({createdAt:-1}).limit(20)));
app.post('/api/ask',async(req,res)=>{try{const r=await fetch(`${AI_URL}/query`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question:req.body.question,top_k:req.body.top_k||4})});const a=await r.json();await Conversation.create({question:req.body.question,answer:a.answer,citations:a.citations});res.json(a)}catch(e){res.status(502).json({error:e.message})}});
app.get('/api/conversations',async(q,s)=>s.json(await Conversation.find().sort({createdAt:-1}).limit(10)));
async function rebuildVectorIndex(){
  try{const docs=await Doc.find();for(const d of docs){await fetch(`${AI_URL}/ingest`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({document_id:String(d._id),title:d.title,text:d.text})});}if(docs.length)console.log(`Re-indexed ${docs.length} documents into AI service`)}catch(e){console.warn('Vector re-index skipped:',e.message)}
}
await rebuildVectorIndex();
app.listen(process.env.PORT||5000,()=>console.log('KnowledgePilot API running'));
