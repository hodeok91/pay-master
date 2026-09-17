class Router {
  constructor(){ this.routes=new Map(); this.stack=[]; this.current=null; }
  register(name,renderer){ this.routes.set(name,renderer); }
  cleanupCurrent(){
    try{ if(typeof window.PayMasterScreenCleanup==="function") window.PayMasterScreenCleanup(); }
    catch(e){ console.warn("screen cleanup failed",e); }
    finally{ window.PayMasterScreenCleanup=null; }
  }
  render(entry){
    const renderer=this.routes.get(entry.name); if(!renderer) throw new Error("Unknown route: "+entry.name);
    this.cleanupCurrent(); this.current=entry;
    document.getElementById("app").replaceChildren(renderer(entry.params||{}));
  }
  go(name,params={},options={}){
    const next={name,params};
    if(options.reset) this.stack=[]; else if(!options.replace && this.current) this.stack.push(this.current);
    this.render(next); return true;
  }
  replace(name,params={}){ return this.go(name,params,{replace:true}); }
  reset(name,params={}){ return this.go(name,params,{replace:true,reset:true}); }
  back(){
    if(this.stack.length){ this.render(this.stack.pop()); return true; }
    if(this.current?.name?.startsWith("samsung.") && this.current.name!=="samsung.wallet"){ this.reset("samsung.wallet"); return true; }
    if(this.current?.name==="samsung.wallet"){ this.reset("home"); return true; }
    return false;
  }
}
export const router=new Router();
