import {env} from 'cloudflare:workers';
import {handleCommunity} from '../../../server/community';
export const dynamic='force-dynamic';
export function GET(request:Request){return handleCommunity(request,env.DB);}
export function POST(request:Request){return handleCommunity(request,env.DB);}
export function DELETE(request:Request){return handleCommunity(request,env.DB);}
