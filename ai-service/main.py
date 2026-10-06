from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np, os, re, httpx

app=FastAPI(title="KnowledgePilot RAG Service",version="1.0.0")
embedder=SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
store={}

def chunks(text, size=700, overlap=120):
    text=re.sub(r'\s+',' ',text).strip(); out=[]; i=0
    while i<len(text):
        out.append(text[i:i+size]); i+=max(1,size-overlap)
    return out

class Ingest(BaseModel): document_id:str; title:str='Untitled'; text:str
class Query(BaseModel): question:str; top_k:int=4

@app.get('/health')
def health(): return {'status':'ok','documents':len(store)}
@app.post('/ingest')
def ingest(req:Ingest):
    cs=chunks(req.text); embs=embedder.encode(cs,normalize_embeddings=True)
    store[req.document_id]={'title':req.title,'chunks':cs,'embeddings':embs}
    return {'document_id':req.document_id,'chunks':len(cs)}

async def llm_answer(question, contexts):
    url=os.getenv('OLLAMA_URL','').rstrip('/'); model=os.getenv('OLLAMA_MODEL','llama3.2')
    if not url: return ' '.join(c['text'] for c in contexts[:2])[:1200]
    prompt='Answer only from the supplied context. If unsupported, say so.\n\n'+"\n\n".join(f"[Source {i+1}] {c['text']}" for i,c in enumerate(contexts))+f"\n\nQuestion: {question}\nAnswer:"
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r=await client.post(f'{url}/api/generate',json={'model':model,'prompt':prompt,'stream':False}); r.raise_for_status(); return r.json().get('response','')
    except Exception:
        return ' '.join(c['text'] for c in contexts[:2])[:1200]

@app.post('/query')
async def query(req:Query):
    q=embedder.encode([req.question],normalize_embeddings=True)[0]; hits=[]
    for did,d in store.items():
        sims=np.dot(d['embeddings'],q)
        for idx in np.argsort(sims)[::-1][:req.top_k]: hits.append({'document_id':did,'title':d['title'],'chunk':int(idx),'score':float(sims[idx]),'text':d['chunks'][idx]})
    hits=sorted(hits,key=lambda x:x['score'],reverse=True)[:req.top_k]
    answer=await llm_answer(req.question,hits)
    return {'answer':answer,'citations':hits}
