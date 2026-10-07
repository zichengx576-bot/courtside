import {env} from 'cloudflare:workers';
import {handleVisitors} from '../../../server/visitors';
export const dynamic='force-dynamic';
export function GET(request:Request){return handleVisitors(request,env.DB);}
export function POST(request:Request){return handleVisitors(request,env.DB);}
