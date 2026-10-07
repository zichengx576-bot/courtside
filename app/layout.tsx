import type { Metadata } from 'next';

export const metadata: Metadata = {
 title:'COURTSIDE — 你的私人球鞋顾问',
 description:'真实球鞋配置、五维对比、NBA 打法模板与 X-dragon 档案问答，找到适合你的下一双球鞋。',
 icons:{icon:'/favicon.svg'}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="zh-CN"><body>{children}</body></html>;
}
