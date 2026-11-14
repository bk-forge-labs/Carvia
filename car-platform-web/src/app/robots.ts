import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots {
 const origin=process.env.NEXT_PUBLIC_SITE_URL;
 return {...(origin?{sitemap:new URL('/sitemap.xml',origin).href}:{}),rules:{userAgent:'*',...(origin?{allow:'/',disallow:['/admin','/dealer','/buyer','/account','/login','/register','/forgot-password','/reset-password','/verify-email','/test','/bookings','/services']}:{disallow:'/'})}};
}
