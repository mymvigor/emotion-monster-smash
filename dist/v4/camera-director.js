export class CameraDirector{
  constructor(view){this.view=view;this.timer=0}
  impact(kind="light",direction=0){clearTimeout(this.timer);this.view.dataset.camera=kind;this.view.style.setProperty("--camera-dir",String(direction||1));this.view.classList.remove("camera-kick");void this.view.offsetWidth;this.view.classList.add("camera-kick");this.timer=setTimeout(()=>{this.view.classList.remove("camera-kick");delete this.view.dataset.camera},kind==="chainsaw"?360:kind==="hammer"?520:300)}
  release(full=false){this.view.classList.toggle("camera-release",true);this.view.classList.toggle("camera-full",full)}
  finisher(){this.view.classList.add("camera-finisher")}
  destroy(){clearTimeout(this.timer);this.view?.classList.remove("camera-kick","camera-release","camera-full","camera-finisher");if(this.view)delete this.view.dataset.camera;this.view=null}
}
