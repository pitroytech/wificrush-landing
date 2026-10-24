'use strict';
// WifiCrush landing: every visible string, English first (the default) and Vietnamese.
// t(key, vars) fills {placeholders}; a string missing in Vietnamese falls back to English.

const STRINGS = {
  en: {
    docTitle: 'WifiCrush · Stay close to your crush',
    docDesc: 'WifiCrush for jailbroken iPhone: stays on the Wi-Fi you love, moves to a stronger one when it fades, and to 4G/5G when every Wi-Fi is weak.',
    brandHome: 'WifiCrush, back to top', navLabel: 'Main', navStories: 'Stories', navRules: 'How it works', navGet: 'Get WifiCrush', langLabel: 'Language',
    heroTitle: 'Stay close to your crush.<br>Too far? <em>Let go.</em>',
    heroLead: 'WifiCrush keeps your iPhone on the Wi-Fi you love while it is strong. When it fades, the phone moves to a stronger network or to 4G/5G, then comes back by itself.',
    heroCta: 'See 4 everyday moments',
    storiesTitle: 'Same iPhone. A different way of picking networks.',
    stageHint: 'One walk, two identical iPhones. Only the one on the right has WifiCrush.',
    sceneLabel: 'Scene: a person carries an iPhone through rooms with Wi-Fi routers',
    play: 'Play', pause: 'Pause', replay: 'Replay',
    withoutTweak: 'Without tweak', withTweak: 'With WifiCrush',
    fineprint: 'A simulation of WifiCrush rules and the usual iOS behaviour. Time is sped up. The speed above each phone is illustrative: it follows the network and its signal, it is not a measurement.',
    rulesTitle: 'Three rings, one easy rule.',
    rule1t: 'Inside the pink ring', rule1: 'While your crush is strong enough, you stay with it, even if a network nearby is a little stronger.',
    rule2t: 'Outside the pink ring', rule2: 'When the network you are on gets weak, WifiCrush moves to a stronger saved one, and goes back once your crush is fine again.',
    rule3t: 'Outside the 4G/5G ring', rule3: 'Every Wi-Fi is weak: it turns to 4G/5G and pauses Wi-Fi auto-join, just like tapping Wi-Fi in Control Center. Good Wi-Fi again, and it rejoins by itself.',
    closingTitle: 'Pick your crush once.<br>One less thing to think about.',
    closingText: 'For rootless jailbroken iPhones on iOS 15 and later. Coming soon to Havoc.',
    footer: 'A simulation page. It does not scan or control any real network.',
    soon: 'Coming soon',
    prevStory: 'Previous story', nextStory: 'Next story', storyOf: 'Story {n} of {total}',

    'story.balcony.title': 'Out to the balcony and back', 'story.balcony.blurb': 'One bar of 5 GHz, and the music stops.',
    'story.outside.title': 'Stepping outside', 'story.outside.blurb': 'Every Wi-Fi is weak, while 4G/5G is fine.',
    'story.call.title': 'An important call, and you have to leave', 'story.call.blurb': 'You cannot hang up. You cannot stay either.',
    'story.office.title': 'An office with a Wi-Fi per room', 'story.office.blurb': 'Every room means picking a network again.',

    'ex.balcony.lead': 'Your home has two bands. 5 GHz is fast but weak through walls; 2.4 GHz is slower but always reaches far.',
    'ex.balcony.b0': 'In your room, 5 GHz is strong, so the phone stays on your crush, the fast one.',
    'ex.balcony.b1': 'On the balcony, 5 GHz drops to one bar. iOS keeps clinging to it. WifiCrush does not: it moves to 2.4 GHz, which is the strong one out here.',
    'ex.balcony.b2': 'Back in your room, WifiCrush goes back to 5 GHz on its own. Without it, you open Settings and pick by hand, twice.',
    'ex.outside.lead': 'Out on the street, your saved Wi-Fi still shows a bar, so iOS will not let go, even though nothing loads.',
    'ex.outside.b0': 'At home, Wi-Fi is strong and the music streams smoothly.',
    'ex.outside.b1': 'When every Wi-Fi is weak and nothing better is around, WifiCrush moves you to 4G/5G and pauses Wi-Fi auto-join, like tapping Wi-Fi in Control Center.',
    'ex.outside.b2': 'Back home, it joins your crush again by itself. Nothing to switch back on.',
    'ex.call.lead': 'A call with a client that cannot stop, and you have to head out now. Over Wi-Fi the voice breaks up by the gate, and iOS lets go of Wi-Fi only once the call has dropped.',
    'ex.call.b0': 'At your desk, on Wi-Fi: a clear voice.',
    'ex.call.b1': 'Out in the yard, Wi-Fi fades. The moment it drops under the 4G/5G level, WifiCrush turns 5G on and the call carries on. No need to call back.',
    'ex.call.b2': 'On the street you are still talking, over 5G. Without WifiCrush, the call has dropped. Back home after the call, Wi-Fi rejoins by itself.',
    'ex.office.lead': 'Many offices split Wi-Fi by room: Sales, Guest, Meeting. Each one opens different things, so you keep picking networks by hand.',
    'ex.office.b0': 'Set the Sales Wi-Fi as your crush. At your desk the phone stays on it, and the internal server opens.',
    'ex.office.b1': 'In the meeting room, pull down Control Center, hold WifiCrush, tap Strongest: you are on the meeting Wi-Fi and the TV shows up.',
    'ex.office.b2': 'Back at your desk, turn Strongest off and you are with your crush again. iOS needs Settings, Wi-Fi and a tap, every single time.',

    'say.start': 'On <b>{net}</b>. Music plays smoothly.',
    'say.startCall': 'On a call with your client over <b>{net}</b>. Clear voice.',
    'say.startOffice': 'On <b>{net}</b>. The internal server opens.',
    'say.stuck': 'Still clinging to <b>{net}</b> at {level} dBm. The music stalls.',
    'say.stillTalking': 'Still talking over <b>5G</b>. No need to call back.',
    'say.stuckCall': 'Still on <b>{net}</b> at {level} dBm. The voice breaks up.',
    'say.slowNet': 'Stuck on <b>{net}</b>: it works, but far slower than 5 GHz.',
    'say.wifiStillOff': 'Home again, but Wi-Fi is still off. Still burning mobile data.',
    'say.wrongNet': 'Still on <b>{net}</b>, so the meeting room TV does not show up.',
    'say.wrongDesk': 'Back at the desk, still on <b>{net}</b>: no internal server.',
    'hand.settings': 'Unlock, open Settings, tap Wi-Fi, pick the network by hand…',
    'hand.toggle': 'Unlock, open Settings, tap Wi-Fi, flip the switch…',
    'hand.cc': 'Pull down Control Center, hold WifiCrush…',
    'join.best': 'Moved to <b>{net}</b> by itself: it is stronger here.',
    'join.crush': 'Your crush is strong again: back on <b>{net}</b>, no taps.',
    'join.recover': 'Good Wi-Fi again: back on <b>{net}</b>, 4G/5G off.',
    'join.strongest': 'Strongest mode: on <b>{net}</b> right away.',
    'join.back': 'Strongest off: back with your crush, <b>{net}</b>.',
    'join.manual': 'Picked <b>{net}</b> by hand. Finally.',
    'join.auto': 'Wi-Fi is on again: iOS joins <b>{net}</b>.',
    'cell.weak': 'Every Wi-Fi is weak: on <b>5G</b> now, Wi-Fi auto-join paused.',
    'cell.call': 'Wi-Fi fading mid-call: moved to <b>5G</b>, the call goes on.',
    'cell.manual': 'Wi-Fi switched off by hand. Music is back, over <b>5G</b>.',
    'cell.lost': 'Wi-Fi is gone completely. Only now does iOS use <b>5G</b>.',
    'call.dropped': 'The call dropped mid-sentence. Calling the client back…',

    'room.living': 'Living room', 'room.bedroom': 'Bedroom', 'room.balcony': 'Balcony', 'room.inside': 'Inside', 'room.yard': 'Yard',
    'room.street': 'Street', 'room.study': 'Your room', 'room.hall': 'Hallway', 'room.stairs': 'Stairs', 'room.sales': 'Sales',
    'room.lobby': 'Lobby', 'room.meeting': 'Meeting room',
    'ap.home5': 'Home 5G', 'ap.home24': 'Home 2.4G', 'ap.sales': 'Office-Sales', 'ap.meeting': 'Office-Meeting', 'ap.guest': 'Office-Guest',
    'wc.auto': 'Auto', 'wc.strongest': 'Strongest',
    'wc.gateT': 'Weak Wi-Fi paused · 4G/5G', 'wc.gateS': 'Rejoins once a network reaches {lte} dBm.',
    'wc.cellT': 'On 4G/5G', 'wc.cellS': 'Waiting for good Wi-Fi.',
    'wc.noneT': 'Not on any network', 'wc.noneS': 'Looking for saved Wi-Fi.',
    'wc.strongT': 'Strongest: {net}', 'wc.strongS': 'Turn it off in Control Center to go back to your crush.',
    'wc.weakT': '{net} is weak ({level} dBm)', 'wc.weakS': 'Looking for a stronger network…',
    'wc.crushT': 'With your crush {net} ({level} dBm)', 'wc.crushS': 'Your crush is strong enough. Enjoy.',
    'wc.otherT': 'On {net} ({level} dBm)', 'wc.otherS': 'Your crush is weak, using a stronger one for now.',
    'wc.cellData': 'Cellular data', 'wc.notConnected': 'Not connected', 'wc.connected': 'Connected', 'wc.crushChip': '♥ Crush',
    'wc.paused': 'Weak Wi-Fi paused', 'wc.excellent': 'Excellent', 'wc.good': 'Good', 'wc.weak': 'Weak',

    'ph.date': 'Friday, October 23', 'ph.song': 'Midnight Drive', 'ph.artist': 'Lo-fi Radio', 'ph.now': 'now',
    'ph.settings': 'Settings', 'ph.search': 'Search', 'ph.name': 'Your Name', 'ph.account': 'Apple Account, iCloud and more',
    'ph.airplane': 'Airplane Mode', 'ph.wifi': 'Wi-Fi', 'ph.bluetooth': 'Bluetooth', 'ph.cellular': 'Cellular', 'ph.hotspot': 'Personal Hotspot',
    'ph.notifications': 'Notifications', 'ph.sounds': 'Sounds & Haptics', 'ph.focus': 'Focus',
    'ph.on': 'On', 'ph.off': 'Off', 'ph.notConnected': 'Not Connected', 'ph.edit': 'Edit',
    'ph.myNetworks': 'MY NETWORKS', 'ph.otherNetworks': 'OTHER NETWORKS',
    'ph.connectedTo': 'Connected to {net}', 'ph.notOnWifi': 'Not on Wi-Fi',
    'ph.strongOn': 'Turn on Strongest mode', 'ph.strongOff': 'Turn off Strongest mode', 'ph.cancel': 'Cancel',
    'ph.caller': 'Client', 'ph.reconnecting': 'Reconnecting…', 'ph.poor': 'Poor connection', 'ph.callEnded': 'Call Ended',
    'app.mail': 'Mail', 'app.calendar': 'Calendar', 'app.photos': 'Photos', 'app.camera': 'Camera', 'app.maps': 'Maps', 'app.weather': 'Weather',
    'app.clock': 'Clock', 'app.notes': 'Notes', 'app.files': 'Files', 'app.video': 'Videos', 'app.appstore': 'App Store', 'app.settings': 'Settings',
  },
  vi: {
    docTitle: 'WifiCrush · Ở gần crush. Xa thì đừng cố.',
    docDesc: 'WifiCrush cho iPhone jailbreak: giữ Wi-Fi bạn thích, tự sang mạng khỏe hơn khi sóng yếu, sang 4G/5G khi mọi Wi-Fi đều yếu.',
    brandHome: 'WifiCrush, về đầu trang', navLabel: 'Điều hướng', navStories: 'Tình huống', navRules: 'Cách hoạt động', navGet: 'Nhận WifiCrush', langLabel: 'Ngôn ngữ',
    heroTitle: 'Ở gần crush.<br>Xa thì <em>đừng cố.</em>',
    heroLead: 'WifiCrush giữ iPhone ở Wi-Fi bạn thích khi sóng còn khỏe. Sóng yếu thì máy tự sang mạng khỏe hơn hoặc 4G/5G, rồi tự quay về.',
    heroCta: 'Xem 4 tình huống',
    storiesTitle: 'Cùng một chiếc iPhone. Khác nhau ở cách chọn mạng.',
    stageHint: 'Cùng một lộ trình, hai iPhone giống hệt nhau. Chỉ máy bên phải có WifiCrush.',
    sceneLabel: 'Cảnh: một người cầm iPhone đi qua các phòng có router Wi-Fi',
    play: 'Chạy', pause: 'Tạm dừng', replay: 'Xem lại',
    withoutTweak: 'Không có tweak', withTweak: 'Có WifiCrush',
    fineprint: 'Mô phỏng theo luật của WifiCrush và cách iOS thường xử lý. Thời gian đã được tua nhanh. Tốc độ trên mỗi máy chỉ để minh hoạ: đi theo mạng và cường độ sóng, không phải số đo thật.',
    rulesTitle: 'Ba vòng sóng, một quy tắc dễ nhớ.',
    rule1t: 'Trong vòng hồng', rule1: 'Crush đủ khỏe thì luôn ở bên crush, kể cả khi gần đó có mạng mạnh hơn một chút.',
    rule2t: 'Ra ngoài vòng hồng', rule2: 'Mạng đang dùng yếu đi thì WifiCrush sang mạng đã lưu khỏe hơn, crush ổn lại thì quay về.',
    rule3t: 'Ngoài vòng 4G/5G', rule3: 'Mọi Wi-Fi đều yếu: chuyển sang 4G/5G và tạm ngưng tự vào Wi-Fi, giống như bạn chạm Wi-Fi trong Trung tâm điều khiển. Có Wi-Fi tốt lại là tự vào.',
    closingTitle: 'Một lần chọn crush.<br>Bớt một điều phải lo.',
    closingText: 'Dành cho iPhone jailbreak rootless, iOS 15 trở lên. Sắp có trên Havoc.',
    footer: 'Trang mô phỏng. Không quét hay điều khiển mạng thật.',
    soon: 'Sắp có',
    prevStory: 'Chuyện trước', nextStory: 'Chuyện sau', storyOf: 'Chuyện {n}/{total}',

    'story.balcony.title': 'Ra ban công rồi về phòng', 'story.balcony.blurb': '5 GHz còn một vạch, nhạc đứng.',
    'story.outside.title': 'Ra đường', 'story.outside.blurb': 'Wi-Fi nào cũng yếu, trong khi 4G/5G vẫn khỏe.',
    'story.call.title': 'Cuộc gọi quan trọng, mà phải ra ngoài', 'story.call.blurb': 'Không thể cúp máy, cũng không thể ở lại.',
    'story.office.title': 'Văn phòng mỗi phòng một Wi-Fi', 'story.office.blurb': 'Sang phòng nào cũng phải chọn lại mạng.',

    'ex.balcony.lead': 'Nhà bạn có hai sóng. 5 GHz nhanh nhưng xuyên tường kém; 2.4 GHz chậm hơn nhưng luôn đi xa, cường độ khỏe.',
    'ex.balcony.b0': 'Trong phòng, 5 GHz khỏe nên điện thoại luôn ở bên crush, mạng nhanh nhất.',
    'ex.balcony.b1': 'Ra ban công, 5 GHz còn một vạch. iOS cứ cố giữ lấy nó. WifiCrush thì không: tự vào 2.4 GHz vì ở đây nó khỏe hơn.',
    'ex.balcony.b2': 'Quay vào phòng, WifiCrush tự về lại 5 GHz mà bạn không cần làm gì. Không có nó, bạn phải vào Cài đặt chọn tay, hai lần.',
    'ex.outside.lead': 'Ra đường, Wi-Fi đã lưu vẫn còn một vạch nên iOS không chịu buông, dù chẳng tải nổi gì.',
    'ex.outside.b0': 'Ở nhà Wi-Fi khỏe, nhạc phát mượt.',
    'ex.outside.b1': 'Khi mọi Wi-Fi đều yếu và không có mạng nào khá hơn, WifiCrush chuyển sang 4G/5G và tạm ngưng tự vào Wi-Fi, giống như bạn chạm Wi-Fi trong Trung tâm điều khiển.',
    'ex.outside.b2': 'Về nhà, nó tự vào lại crush. Không phải bật lại gì.',
    'ex.call.lead': 'Đang gọi với khách hàng, không thể dừng, mà bạn phải ra ngoài ngay. Qua Wi-Fi, tới cổng là tiếng đã rè, và iOS chỉ chịu bỏ Wi-Fi khi cuộc gọi đã rớt.',
    'ex.call.b0': 'Ở bàn làm việc, qua Wi-Fi: tiếng rõ.',
    'ex.call.b1': 'Ra tới sân, Wi-Fi yếu dần. Sóng vừa xuống dưới mức 4G/5G là WifiCrush bật 5G ngay, cuộc gọi vẫn tiếp. Không phải gọi lại.',
    'ex.call.b2': 'Ra tới đường bạn vẫn đang nói chuyện, qua 5G. Không có WifiCrush thì cuộc gọi đã rớt. Gác máy về nhà, Wi-Fi tự vào lại.',
    'ex.office.lead': 'Nhiều văn phòng chia Wi-Fi theo phòng: Kinh doanh, Khách, Phòng họp. Mỗi mạng mở được những thứ khác nhau nên bạn cứ phải chọn tay.',
    'ex.office.b0': 'Đặt Wi-Fi kinh doanh làm crush. Ở bàn làm việc, máy luôn ở đó và vào được máy chủ nội bộ.',
    'ex.office.b1': 'Vào phòng họp, kéo Trung tâm điều khiển, giữ WifiCrush, chạm Khỏe nhất: máy vào Wi-Fi phòng họp và thấy TV.',
    'ex.office.b2': 'Về chỗ, tắt Khỏe nhất là về lại crush. iOS thì lần nào cũng phải vào Cài đặt, Wi-Fi rồi chạm chọn.',

    'say.start': 'Đang ở <b>{net}</b>. Nhạc phát mượt.',
    'say.startCall': 'Đang gọi với khách hàng qua <b>{net}</b>. Tiếng rõ.',
    'say.startOffice': 'Đang ở <b>{net}</b>. Vào được máy chủ nội bộ.',
    'say.stuck': 'Vẫn cố giữ <b>{net}</b> ở {level} dBm. Nhạc đứng.',
    'say.stillTalking': 'Vẫn nói chuyện qua <b>5G</b>. Không phải gọi lại.',
    'say.stuckCall': 'Vẫn bám <b>{net}</b> ở {level} dBm. Tiếng rè, ngắt quãng.',
    'say.slowNet': 'Kẹt ở <b>{net}</b>: dùng được nhưng chậm hơn 5 GHz nhiều.',
    'say.wifiStillOff': 'Về nhà rồi mà Wi-Fi vẫn tắt. Vẫn đang tốn 4G/5G.',
    'say.wrongNet': 'Vẫn ở <b>{net}</b> nên không thấy TV phòng họp.',
    'say.wrongDesk': 'Về chỗ mà vẫn ở <b>{net}</b>: không vào được máy chủ nội bộ.',
    'hand.settings': 'Mở khóa, vào Cài đặt, chạm Wi-Fi, tự chọn mạng…',
    'hand.toggle': 'Mở khóa, vào Cài đặt, chạm Wi-Fi, gạt công tắc…',
    'hand.cc': 'Kéo Trung tâm điều khiển, giữ WifiCrush…',
    'join.best': 'Tự sang <b>{net}</b>: ở đây mạng này khỏe hơn.',
    'join.crush': 'Crush khỏe lại: tự về <b>{net}</b>, không phải chạm gì.',
    'join.recover': 'Có Wi-Fi tốt lại: tự vào <b>{net}</b>, tắt 4G/5G.',
    'join.strongest': 'Chế độ khỏe nhất: vào ngay <b>{net}</b>.',
    'join.back': 'Tắt khỏe nhất: về lại crush <b>{net}</b>.',
    'join.manual': 'Đã chọn tay <b>{net}</b>. Cuối cùng cũng xong.',
    'join.auto': 'Bật lại Wi-Fi: iOS vào <b>{net}</b>.',
    'cell.weak': 'Wi-Fi nào cũng yếu: chuyển sang <b>5G</b>, tạm ngưng tự vào Wi-Fi.',
    'cell.call': 'Wi-Fi yếu giữa cuộc gọi: chuyển ngay sang <b>5G</b>, cuộc gọi vẫn tiếp.',
    'cell.manual': 'Đã tự tắt Wi-Fi. Nhạc chạy lại qua <b>5G</b>.',
    'cell.lost': 'Wi-Fi mất hẳn, iOS mới chuyển sang <b>5G</b>.',
    'call.dropped': 'Cuộc gọi rớt giữa câu. Phải gọi lại cho khách…',

    'room.living': 'Phòng khách', 'room.bedroom': 'Phòng ngủ', 'room.balcony': 'Ban công', 'room.inside': 'Trong nhà', 'room.yard': 'Sân',
    'room.street': 'Ngoài đường', 'room.study': 'Phòng riêng', 'room.hall': 'Hành lang', 'room.stairs': 'Cầu thang', 'room.sales': 'Phòng kinh doanh',
    'room.lobby': 'Sảnh', 'room.meeting': 'Phòng họp',
    'ap.home5': 'Nhà mình 5G', 'ap.home24': 'Nhà mình 2.4G', 'ap.sales': 'VP-KinhDoanh', 'ap.meeting': 'VP-PhongHop', 'ap.guest': 'VP-Khach',
    'wc.auto': 'Tự động', 'wc.strongest': 'Khỏe nhất',
    'wc.gateT': 'Tạm ngưng Wi-Fi yếu · 4G/5G', 'wc.gateS': 'Có mạng từ {lte} dBm là tự vào lại.',
    'wc.cellT': 'Đang dùng 4G/5G', 'wc.cellS': 'Chờ Wi-Fi tốt.',
    'wc.noneT': 'Chưa vào mạng nào', 'wc.noneS': 'Đang tìm Wi-Fi đã lưu.',
    'wc.strongT': 'Khỏe nhất: {net}', 'wc.strongS': 'Tắt trong Trung tâm điều khiển để về crush.',
    'wc.weakT': '{net} đang yếu ({level} dBm)', 'wc.weakS': 'Đang tìm mạng khỏe hơn…',
    'wc.crushT': 'Bên crush {net} ({level} dBm)', 'wc.crushS': 'Crush đủ khỏe, cứ dùng thôi.',
    'wc.otherT': 'Đang dùng {net} ({level} dBm)', 'wc.otherS': 'Crush yếu, tạm dùng mạng khỏe hơn.',
    'wc.cellData': 'Dữ liệu di động', 'wc.notConnected': 'Chưa kết nối', 'wc.connected': 'Đã vào mạng', 'wc.crushChip': '♥ Mạng crush',
    'wc.paused': 'Tạm ngưng Wi-Fi yếu', 'wc.excellent': 'Rất tốt', 'wc.good': 'Khá', 'wc.weak': 'Yếu',

    'ph.date': 'Thứ Sáu, 23 tháng 10', 'ph.now': 'bây giờ',
    'ph.settings': 'Cài đặt', 'ph.search': 'Tìm kiếm', 'ph.name': 'Tên của bạn', 'ph.account': 'Tài khoản Apple, iCloud và hơn nữa',
    'ph.airplane': 'Chế độ máy bay', 'ph.cellular': 'Di động', 'ph.hotspot': 'Điểm truy cập cá nhân',
    'ph.notifications': 'Thông báo', 'ph.sounds': 'Âm thanh & cảm ứng', 'ph.focus': 'Tập trung',
    'ph.on': 'Bật', 'ph.off': 'Tắt', 'ph.notConnected': 'Chưa kết nối', 'ph.edit': 'Sửa',
    'ph.myNetworks': 'MẠNG CỦA TÔI', 'ph.otherNetworks': 'MẠNG KHÁC',
    'ph.connectedTo': 'Đã vào mạng {net}', 'ph.notOnWifi': 'Chưa vào Wi-Fi',
    'ph.strongOn': 'Bật chế độ khỏe nhất', 'ph.strongOff': 'Tắt chế độ khỏe nhất', 'ph.cancel': 'Huỷ',
    'ph.caller': 'Khách hàng', 'ph.reconnecting': 'Đang kết nối lại…', 'ph.poor': 'Kết nối kém', 'ph.callEnded': 'Cuộc gọi kết thúc',
    'app.mail': 'Mail', 'app.calendar': 'Lịch', 'app.photos': 'Ảnh', 'app.camera': 'Camera', 'app.maps': 'Bản đồ', 'app.weather': 'Thời tiết',
    'app.clock': 'Đồng hồ', 'app.notes': 'Ghi chú', 'app.files': 'Tệp', 'app.video': 'Video', 'app.settings': 'Cài đặt',
  },
};

let LANG = 'en';

function t(key, vars) {
  const s = STRINGS[LANG][key] ?? STRINGS.en[key] ?? key;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
}

function initialLang() {
  const asked = new URLSearchParams(location.search).get('lang');
  if (asked && asked in STRINGS) return asked;
  try {
    const saved = localStorage.getItem('wificrush-lang');
    if (saved && saved in STRINGS) return saved;
  } catch (e) { /* storage blocked: English */ }
  return 'en';
}

function saveLang(lang) {
  try { localStorage.setItem('wificrush-lang', lang); } catch (e) { /* storage blocked: this visit only */ }
}

function applyStatic() {
  document.documentElement.lang = LANG;
  document.title = t('docTitle');
  document.querySelector('meta[name="description"]').setAttribute('content', t('docDesc'));
  document.querySelectorAll('[data-i18n]').forEach(n => { n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(n => { n.innerHTML = t(n.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-aria]').forEach(n => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
}
