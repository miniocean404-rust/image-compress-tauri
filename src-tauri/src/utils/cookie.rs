// use crate::error::Result;
// use tauri::Window;
// use webview2_com::{
//     take_pwstr, GetCookiesCompletedHandler,
//     Microsoft::Web::WebView2::Win32::{ICoreWebView2Cookie, ICoreWebView2_2},
// };
// use windows::core::{Interface, HSTRING, PWSTR};

// #[derive(Debug, serde::Serialize, serde::Deserialize)]
// pub struct Cookie {
//     pub name: String,
//     pub value: String,
//     pub domain: String,
//     pub path: String,
// }
// /**
//  * 运行获取cookie
//  */
// pub async fn get_win_cookie(
//     win: &Window,
//     url: &'static str, // 要获取cookie的网址
// ) -> Result<Vec<Cookie>> {
//     // 因为操作是一个异步的，咱们使用oneshot::channel来传输数据
//     let (done_tx, done_rx) = oneshot::channel::<Vec<Cookie>>();
//     win.with_webview(move |webview| unsafe {
//         // 获取webview2的com接口
//         let core = webview.controller().CoreWebView2().unwrap();
//         // 获取webview2的com接口 ICoreWebView2_2
//         let core2 = Interface::cast::<ICoreWebView2_2>(&core).unwrap();
//         // 将字符串转换为windows系统的宽字符格式应该 WinRT string
//         let uri = HSTRING::from(url);
//         // 获取浏览器的Cookie的管理模块
//         let manager = core2.CookieManager().unwrap();
//         // 异步获取cookie
//         GetCookiesCompletedHandler::wait_for_async_operation(
//             Box::new(move |handler| {
//                 manager.GetCookies(&uri, &handler)?;
//                 Ok(())
//             }),
//             Box::new(move |hresult, list| {
//                 hresult?;
//                 match list {
//                     Some(list) => {
//                         let mut count: u32 = 0;
//                         list.Count(&mut count)?;
//                         // tracing::info!("count: {}", count);
//                         let mut cookies = vec![];
//                         for i in 0..count {
//                             let cookie: ICoreWebView2Cookie = list.GetValueAtIndex(i)?;
//                             let mut name = PWSTR::null();
//                             let mut value = PWSTR::null();
//                             let mut domain = PWSTR::null();
//                             let mut path = PWSTR::null();
//                             cookie.Name(&mut name)?;
//                             cookie.Value(&mut value)?;
//                             cookie.Domain(&mut domain)?;
//                             cookie.Path(&mut path)?;
//                             cookies.push(Cookie {
//                                 name: take_pwstr(name),
//                                 value: take_pwstr(value),
//                                 domain: take_pwstr(domain),
//                                 path: take_pwstr(path),
//                             });
//                         }
//                         done_tx.send(cookies).unwrap();
//                     }
//                     None => {
//                         // 没得数据
//                     }
//                 };
//                 Ok(())
//             }),
//         )
//         .unwrap();
//     })
//     .unwrap();
//     let cookies = done_rx.await.unwrap();
//     Ok(cookies)
// }
