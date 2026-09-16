class Router {
  constructor(){ this.routes=new Map(); this.stack=[]; this.current=null; }
  register(name, renderer){ this.routes.set(name, renderer); }
  go(name, params={}, options={}){
    const render=this.routes.get(name); if(!render) throw new Error("Unknown route: "+name);
    if(!options.replace && this.current) this.stack.push(this.current);
    this.current={name,params};
    document.getElementById("app").replaceChildren(render(params));
    return true;
  }
  back(){
    if(!this.stack.length) return false;
    const prev=this.stack.pop(); this.current=prev;
    document.getElementById("app").replaceChildren(this.routes.get(prev.name)(prev.params));
    return true;
  }
}
export const router=new Router();
