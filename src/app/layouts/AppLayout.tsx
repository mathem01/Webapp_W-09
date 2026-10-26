import type { RequestInfo } from "rwsdk/worker";

export function MyPage ({ctx}: RequestInfo) {

const {username, email} = ctx.session; 

const initial = username?.charAt(0).toUpperCase() || "?";

return(

<section className="min-h-[80vh]" >

</section>



)


}