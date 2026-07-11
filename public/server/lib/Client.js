import state, { getActiveRoomState } from "./state.js";
import RoomManager from "./Room.js";
import { Entity, Mob, Player } from "./Entity.js";
import { Reader, Writer, CLIENT_BOUND, ENTITY_FLAGS, ENTITY_MODIFIER_FLAGS, ROUTER_PACKET_TYPES, SERVER_BOUND, ENTITY_TYPES, DEV_CHEAT_IDS, WEARABLES } from "../../lib/protocol.js";
import { mobConfigs, mobIDOf, petalConfigs, petalIDOf, tiers } from "./config.js";
import { xpForLevel } from "../../lib/util.js";

const blockList = [];
fetch((typeof Bun !== "undefined" ? Bun.env.GAME_SERVER : "") + "/profanity.txt").then(res => res.text()).then(txt => {
    blockList.push(...txt.replaceAll("\r", "").split("\n").map(e => e.trim()));
    console.log("Profanity list loaded", blockList.length, "words");
});

const patterns = [
    /\b([sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ][a4ÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ][nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ][dĎďḊḋḐḑD̦d̦ḌḍḒḓḎḏĐđÐðƉɖƊɗᵭᶁᶑȡ])*[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌoÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏІіa4ÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ]*[gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]+(l[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+t+|[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅa4ÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ]*[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]*|n[ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]+[gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]+|[a4ÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ]*)*[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/,
    /[fḞḟƑƒꞘꞙᵮᶂ]+[aÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ@4]+[gǴǵĞğĜĝǦǧĠġG̃g̃ĢģḠḡǤǥꞠꞡƓɠᶃꬶＧｇqꝖꝗꝘꝙɋʠ]+([ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅiÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ]+([rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[yÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+|[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+)?)?[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/,
    /\b[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌyÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]([rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[yÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+|[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+)?[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/,
    /\b[tŤťṪṫŢţṬṭȚțṰṱṮṯŦŧȾⱦƬƭƮʈT̈ẗᵵƫȶ]+[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+([aÁáÀàĂăẮắẰằẴẵẲẳÂâẤấẦầẪẫẨẩǍǎÅåǺǻÄäǞǟÃãȦȧǠǡĄąĄ́ą́Ą̃ą̃ĀāĀ̀ā̀ẢảȀȁA̋a̋ȂȃẠạẶặẬậḀḁȺⱥꞺꞻᶏẚＡａ4]+[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+([iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+|[yÝýỲỳŶŷY̊ẙŸÿỸỹẎẏȲȳỶỷỴỵɎɏƳƴỾỿ]+|[e3ЄєЕеÉéÈèĔĕÊêẾếỀềỄễỂểÊ̄ê̄Ê̌ê̌ĚěËëẼẽĖėĖ́ė́Ė̃ė̃ȨȩḜḝĘęĘ́ę́Ę̃ę̃ĒēḖḗḔḕẺẻȄȅE̋e̋ȆȇẸẹỆệḘḙḚḛɆɇE̩e̩È̩è̩É̩é̩ᶒⱸꬴꬳＥｅ]+[rŔŕŘřṘṙŖŗȐȑȒȓṚṛṜṝṞṟR̃r̃ɌɍꞦꞧⱤɽᵲᶉꭉ]+|[oÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[dĎďḊḋḐḑD̦d̦ḌḍḒḓḎḏĐđÐðƉɖƊɗᵭᶁᶑȡ]+)|[oÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[dĎďḊḋḐḑD̦d̦ḌḍḒḓḎḏĐđÐðƉɖƊɗᵭᶁᶑȡ]+)[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/,
    /\b[cĆćĈĉČčĊċÇçḈḉȻȼꞒꞓꟄꞔƇƈɕ]+[ÓóÒòŎŏÔôỐốỒồỖỗỔổǑǒÖöȪȫŐőÕõṌṍṎṏȬȭȮȯO͘o͘ȰȱØøǾǿǪǫǬǭŌōṒṓṐṑỎỏȌȍȎȏƠơỚớỜờỠỡỞởỢợỌọỘộO̩o̩Ò̩ò̩Ó̩ó̩ƟɵꝊꝋꝌꝍⱺＯｏ0]{2,}[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/,
    /\b[cĆćĈĉČčĊċÇçḈḉȻȼꞒꞓꟄꞔƇƈɕ]+[hĤĥȞȟḦḧḢḣḨḩḤḥḪḫH̱ẖĦħⱧⱨꞪɦꞕΗНн]+[iÍíi̇́Ììi̇̀ĬĭÎîǏǐÏïḮḯĨĩi̇̃ĮįĮ́į̇́Į̃į̇̃ĪīĪ̀ī̀ỈỉȈȉI̋i̋ȊȋỊịꞼꞽḬḭƗɨᶖİiIıＩｉ1lĺľļḷḹl̃ḽḻłŀƚꝉⱡɫɬꞎꬷꬸꬹᶅɭȴＬｌ]+[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲŊŋꞐꞑꞤꞥᵰᶇɳȵꬻꬼИиПпＮｎ]+[kḰḱǨǩĶķḲḳḴḵƘƙⱩⱪᶄꝀꝁꝂꝃꝄꝅꞢꞣ]+[sŚśṤṥŜŝŠšṦṧṠṡŞşṢṣṨṩȘșS̩s̩ꞨꞩⱾȿꟅʂᶊᵴ]*\b/
];

const tripsFilter = message => patterns.some(p => p.test(message));

const CRAFT_CHANCES = [0.64, 0.32, 0.16, 0.08, 0.04, 0.02, 0.01, 0.001, 0];

const ORACLE_RATES = [7, 11, 19, 34, 65, 128, 253, 2503];

const MERGE_RECIPES = [
    { inputs: [{ petal: "light", count: 1 }, { petal: "rose", count: 1 }], output: "Dahlia" },
    { inputs: [{ petal: "leaf", count: 1 }, { petal: "sand", count: 1 }], output: "Yucca" },
    { inputs: [{ petal: "stinger", count: 1 }, { petal: "iris", count: 1 }], output: "Venomous Stinger" },
    { inputs: [{ petal: "leaf", count: 1 }, { petal: "salt", count: 2 }], output: "Starfish" },
    { inputs: [{ petal: "peas", count: 1 }, { petal: "iris", count: 1 }], output: "Grapes" },
    { inputs: [{ petal: "dandelion", count: 1 }, { petal: "iris", count: 1 }], output: "Fig" },
    { inputs: [{ petal: "dandelion", count: 3 }, { petal: "cactus", count: 1 }], output: "Rubber" }
];

const SHOP_CATALOG = [
    { petal: "Sand", price: 4 },
    { petal: "Dandelion", price: 4 },
    { petal: "Rose", price: 8 },
    { petal: "Missile", price: 16 },
    { petal: "Stinger", price: 16 },
    { petal: "Lentil", price: 16 },
    { petal: "Lightning", price: 48 },
    { petal: "Pearl", price: 64 },
];

function craftSuccessChance(rarityIndex) {
    return CRAFT_CHANCES[rarityIndex] ?? 0;
}
function broadcastAll(message, color) {
    for (const room of RoomManager.rooms) {
        for (const client of room.roomState.clients.values()) {
            client.systemMessage(message, color);
        }
    }
}

function isNearMob(client, mobName, radius = 256) {
    if (!client.body) return false;
    return state.aliveMobs.some(mob =>
        mob.config?.name === mobName &&
        !mob.health?.isDead &&
        Math.hypot(mob.x - client.body.x, mob.y - client.body.y) <= radius
    );
}

function findTierIndexByName(name) {
    const lower = name.toLowerCase();
    return tiers.findIndex(t => t.name.toLowerCase() === lower);
}

function findPetalIndexByName(name) {
    const lower = name.toLowerCase();
    return petalConfigs.findIndex(p => p.name.toLowerCase() === lower);
}

/**
 * @param {string[]} args
 * @returns {{rarityIndex: number, petalIndex: number, amount: number}|null}
 */
function parseRarityPetalAmount(args) {
    if (args.length < 2) return null;

    const rarityIndex = findTierIndexByName(args[0]);
    if (rarityIndex === -1) return null;

    let amount = 1;
    let nameArgs = args.slice(1);
    const last = nameArgs[nameArgs.length - 1];
    if (nameArgs.length > 1 && /^\d+$/.test(last)) {
        amount = Math.max(1, parseInt(last, 10));
        nameArgs = nameArgs.slice(0, -1);
    }

    const petalName = nameArgs.join(" ");
    const petalIndex = findPetalIndexByName(petalName);
    if (petalIndex === -1) return null;

    return { rarityIndex, petalIndex, amount };
}

function findClientByUsername(username) {
    const lower = username.toLowerCase();
    for (const room of RoomManager.rooms) {
        for (const client of room.roomState.clients.values()) {
            if (client.verified && client.username.toLowerCase() === lower) {
                return client;
            }
        }
    }
    return null;
}

export class PlayerClientCache {
    id = 0;
    name = "";
    nameColor = "#FFFFFF";
    rarity = 0;
    level = 0;
    isNew = true;

    x = 0;
    y = 0;
    size = 0;
    facing = 0;
    flags = 0;
    healthRatio = 1;
    shieldRatio = 0;
    team = 0;
    wearing = 0;

    updatePosition = false;
    updateSize = false;
    updateFacing = false;
    updateFlags = false;
    updateHealth = false;
    updateDisplay = false;

    /** @param {Entity} real */
    update(real) {
        if (this.x !== real.x || this.y !== real.y) {
            this.x = real.x;
            this.y = real.y;
            this.updatePosition = true;
        }

        if (this.size !== real.size) {
            this.size = real.size;
            this.updateSize = true;
        }

        if (this.facing !== real.facing) {
            this.facing = real.facing;
            this.updateFacing = true;
        }

        let flags = 0;

        if (real.hit > 0) {
            flags |= ENTITY_MODIFIER_FLAGS.HIT;
        }

        if (real.attack) {
            flags |= ENTITY_MODIFIER_FLAGS.ATTACK;
        }

        if (real.defend) {
            flags |= ENTITY_MODIFIER_FLAGS.DEFEND;
        }

        if (real.poison.timer > 0) {
            flags |= ENTITY_MODIFIER_FLAGS.POISON;
        }

        let team = Math.min(255, Math.max(0, real.team < 0 ? -real.team : 0));
        if (team !== this.team) {
            this.team = team;
            flags |= ENTITY_MODIFIER_FLAGS.TDM;
        }

        let realWearing = 0;
        for (const key in WEARABLES) {
            if (real.wearing[WEARABLES[key]] > 0) {
                realWearing |= WEARABLES[key];
            }
        }

        if (realWearing !== this.wearing) {
            this.wearing = realWearing;
            flags |= ENTITY_MODIFIER_FLAGS.WEARABLES;
        }

        if (flags !== this.flags) {
            this.flags = flags;
            this.updateFlags = true;
        }

        if (this.healthRatio !== real.health.ratio || this.shieldRatio !== real.health.shieldRatio) {
            this.healthRatio = real.health.ratio;
            this.shieldRatio = real.health.shieldRatio;
            this.updateHealth = true;
        }

        if (this.rarity !== real.rarity || this.level !== real.level || this.name !== real.name || this.nameColor !== real.nameColor) {
            this.rarity = real.rarity;
            this.level = real.level;
            this.name = real.name;
            this.nameColor = real.nameColor;
            this.updateDisplay = true;
        }
    }

    /** @param {Writer} writer */
    pipe(writer) {
        if (!this.isNew && !this.updatePosition && !this.updateSize && !this.updateFacing && !this.updateFlags && !this.updateHealth && !this.updateDisplay) {
            return;
        }

        if (this.isNew) {
            this.isNew = false;
            this.updatePosition = false;
            this.updateSize = false;
            this.updateFacing = false;
            this.updateFlags = false;

            writer.setUint32(this.id);
            writer.setUint8(ENTITY_FLAGS.NEW);
            writer.setStringUTF8(this.name);
            writer.setStringUTF8(this.nameColor);
            writer.setUint8(this.rarity);
            writer.setUint16(this.level);
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
            writer.setFloat32(this.size);
            writer.setFloat32(this.facing);
            writer.setUint8(this.flags);

            if (this.flags & ENTITY_MODIFIER_FLAGS.TDM) {
                writer.setUint8(this.team);
            }

            if (this.flags & ENTITY_MODIFIER_FLAGS.WEARABLES) {
                writer.setUint8(this.wearing);
            }

            writer.setUint8(this.healthRatio * 255 + .5 | 0);
            writer.setUint8(this.shieldRatio * 255 + .5 | 0);
            return;
        }

        writer.setUint32(this.id);
        writer.setUint8(
            (this.updatePosition ? ENTITY_FLAGS.POSITION : 0) |
            (this.updateSize ? ENTITY_FLAGS.SIZE : 0) |
            (this.updateFacing ? ENTITY_FLAGS.FACING : 0) |
            (this.updateFlags ? ENTITY_FLAGS.FLAGS : 0) |
            (this.updateHealth ? ENTITY_FLAGS.HEALTH : 0) |
            (this.updateDisplay ? ENTITY_FLAGS.DISPLAY : 0)
        );

        if (this.updatePosition) {
            this.updatePosition = false;
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
        }

        if (this.updateSize) {
            this.updateSize = false;
            writer.setFloat32(this.size);
        }

        if (this.updateFacing) {
            this.updateFacing = false;
            writer.setFloat32(this.facing);
        }

        if (this.updateFlags) {
            this.updateFlags = false;
            writer.setUint8(this.flags);

            if (this.flags & ENTITY_MODIFIER_FLAGS.TDM) {
                writer.setUint8(this.team);
            }

            if (this.flags & ENTITY_MODIFIER_FLAGS.WEARABLES) {
                writer.setUint8(this.wearing);
            }
        }

        if (this.updateHealth) {
            this.updateHealth = false;
            writer.setUint8(this.healthRatio * 255 + .5 | 0);
            writer.setUint8(this.shieldRatio * 255 + .5 | 0);
        }

        if (this.updateDisplay) {
            this.updateDisplay = false;
            writer.setStringUTF8(this.name);
            writer.setStringUTF8(this.nameColor);
            writer.setUint8(this.rarity);
            writer.setUint16(this.level);
        }
    }
}

export class PetalClientCache {
    id = 0;
    index = 0;
    rarity = 0;
    isNew = true;

    x = 0;
    y = 0;
    size = 0;
    facing = 0;
    hit = false;

    updatePosition = false;
    updateSize = false;
    updateFacing = false;
    updateFlags = false;

    /** @param {Entity} real */
    update(real) {
        if (this.x !== real.x || this.y !== real.y) {
            this.x = real.x;
            this.y = real.y;
            this.updatePosition = true;
        }

        if (this.size !== real.size) {
            this.size = real.size;
            this.updateSize = true;
        }

        if (this.facing !== real.facing) {
            this.facing = real.facing;
            this.updateFacing = true;
        }

        if (this.hit !== real.hit) {
            this.hit = real.hit > 0;
            this.updateFlags = true;
        }
    }

    /** @param {Writer} writer */
    pipe(writer) {
        if (!this.isNew && !this.updatePosition && !this.updateSize && !this.updateFacing && !this.updateFlags) {
            return;
        }

        if (this.isNew) {
            this.isNew = false;
            this.updatePosition = false;
            this.updateSize = false;
            this.updateFacing = false;
            this.updateFlags = false;

            writer.setUint32(this.id);
            writer.setUint8(ENTITY_FLAGS.NEW);
            writer.setUint8(this.index);
            writer.setUint8(this.rarity);
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
            writer.setFloat32(this.size);
            writer.setFloat32(this.facing);
            writer.setUint8(this.hit ? ENTITY_MODIFIER_FLAGS.HIT : 0x00);
            return;
        }

        writer.setUint32(this.id);
        writer.setUint8(
            (this.updatePosition ? ENTITY_FLAGS.POSITION : 0) |
            (this.updateSize ? ENTITY_FLAGS.SIZE : 0) |
            (this.updateFacing ? ENTITY_FLAGS.FACING : 0) |
            (this.updateFlags ? ENTITY_FLAGS.FLAGS : 0)
        );

        if (this.updatePosition) {
            this.updatePosition = false;
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
        }

        if (this.updateSize) {
            this.updateSize = false;
            writer.setFloat32(this.size);
        }

        if (this.updateFacing) {
            this.updateFacing = false;
            writer.setFloat32(this.facing);
        }

        if (this.updateFlags) {
            this.updateFlags = false;
            writer.setUint8(this.hit ? ENTITY_MODIFIER_FLAGS.HIT : 0x00);
        }
    }
}

export class MobClientCache {
    id = 0;
    index = 0;
    rarity = 0;
    isNew = true;

    x = 0;
    y = 0;
    size = 0;
    facing = 0;
    flags = 0;
    healthRatio = 1;
    ropeBodies = [];

    updatePosition = false;
    updateSize = false;
    updateFacing = false;
    updateFlags = false;
    updateHealth = false;
    updateRopeBodies = false;

    /** @param {Mob} real */
    update(real) {
        if (this.x !== real.x || this.y !== real.y) {
            this.x = real.x;
            this.y = real.y;
            this.updatePosition = true;
        }

        if (this.size !== real.size) {
            this.size = real.size;
            this.updateSize = true;
        }

        if (this.facing !== real.facing) {
            this.facing = real.facing;
            this.updateFacing = true;
        }

        let flags = 0;

        if (real.hit > 0) {
            flags |= ENTITY_MODIFIER_FLAGS.HIT;
        }

        if (real.ropeBodies?.length > 0) {
            this.updateRopeBodies = true;
            this.ropeBodies = [{
                x: 0,
                y: 0
            }];

            for (let i = 0; i < real.ropeBodies.length; i++) {
                if (real.ropeBodies[i].hit > 0) {
                    if ((flags & ENTITY_MODIFIER_FLAGS.HIT) === 0) {
                        flags |= ENTITY_MODIFIER_FLAGS.HIT;
                    }
                }

                this.ropeBodies.push({
                    x: (real.ropeBodies[i].x - this.x) / this.size,
                    y: (real.ropeBodies[i].y - this.y) / this.size
                });
            }
        }

        if (real.target !== null) {
            flags |= ENTITY_MODIFIER_FLAGS.ATTACK;
        }

        if (real.poison.timer > 0) {
            flags |= ENTITY_MODIFIER_FLAGS.POISON;
        }

        if (real.friendly) {
            flags |= ENTITY_MODIFIER_FLAGS.FRIEND;
        }

        if (flags !== this.flags) {
            this.flags = flags;
            this.updateFlags = true;
        }

        if (this.healthRatio !== real.health.ratio) {
            this.healthRatio = real.health.ratio;
            this.updateHealth = true;
        }
    }

    /** @param {Writer} writer */
    pipe(writer) {
        if (!this.isNew && !this.updatePosition && !this.updateSize && !this.updateFacing && !this.updateFlags && !this.updateHealth && !this.updateRopeBodies) {
            return;
        }

        if (this.isNew) {
            this.isNew = false;
            this.updatePosition = false;
            this.updateSize = false;
            this.updateFacing = false;
            this.updateFlags = false;

            writer.setUint32(this.id);
            writer.setUint8(ENTITY_FLAGS.NEW);
            writer.setUint8(this.index);
            writer.setUint8(this.rarity);
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
            writer.setFloat32(this.size);
            writer.setFloat32(this.facing);
            writer.setUint8(this.flags);
            writer.setUint8(this.healthRatio * 255 + .5 | 0);
            return;
        }

        writer.setUint32(this.id);
        writer.setUint8(
            (this.updatePosition ? ENTITY_FLAGS.POSITION : 0) |
            (this.updateSize ? ENTITY_FLAGS.SIZE : 0) |
            (this.updateFacing ? ENTITY_FLAGS.FACING : 0) |
            (this.updateFlags ? ENTITY_FLAGS.FLAGS : 0) |
            (this.updateHealth ? ENTITY_FLAGS.HEALTH : 0) |
            (this.updateRopeBodies ? ENTITY_FLAGS.ROPE_BODIES : 0)
        );

        if (this.updatePosition) {
            this.updatePosition = false;
            writer.setFloat32(this.x);
            writer.setFloat32(this.y);
        }

        if (this.updateSize) {
            this.updateSize = false;
            writer.setFloat32(this.size);
        }

        if (this.updateFacing) {
            this.updateFacing = false;
            writer.setFloat32(this.facing);
        }

        if (this.updateFlags) {
            this.updateFlags = false;
            writer.setUint8(this.flags);
        }

        if (this.updateHealth) {
            this.updateHealth = false;
            writer.setUint8(this.healthRatio * 255 + .5 | 0);
        }

        if (this.updateRopeBodies) {
            this.updateRopeBodies = false;
            writer.setUint8(this.ropeBodies.length);
            for (let i = 0; i < this.ropeBodies.length; i++) {
                writer.setFloat32(this.ropeBodies[i].x);
                writer.setFloat32(this.ropeBodies[i].y);
            }
        }
    }
}

export class MarkerClientCache {
    id = 0;
    isNew = true;

    x = 0;
    y = 0;
    size = 0;
    creation = 0;
    timer = 0;

    pipe(writer) {
        if (!this.isNew) {
            return;
        }

        this.isNew = false;
        writer.setUint32(this.id);
        writer.setUint8(ENTITY_FLAGS.NEW);
        writer.setFloat32(this.x);
        writer.setFloat32(this.y);
        writer.setFloat32(this.size);
        writer.setStringUTF8(this.creation);
        writer.setUint32(this.timer + .5 | 0);
    }

    kill(writer) {
        writer.setUint32(this.id);
        writer.setUint8(ENTITY_FLAGS.DIE);
    }
}

export class Camera {
    x = 0;
    y = 0;
    fov = 500;
    lightingBoost = 0;

    /** @type {Map<number, PlayerClientCache>} */
    playerCache = new Map();

    /** @type {Map<number, PetalClientCache>} */
    petalCache = new Map();

    /** @type {Map<number, MobClientCache>} */
    mobCache = new Map();

    /** @type {Map<number, MarkerClientCache>} */
    markerCache = new Map();

    /** @type {Set<number>} */
    lightningCache = new Set();

    dropsToAdd = [];
    dropsToRemove = [];

    /** @param {Writer} writer */
    see(writer) {
        const retrieved = state.viewsSpatialHash.retrieve({
            _AABB: {
                x1: this.x - this.fov / 1.85,
                y1: this.y - this.fov / 1.85,
                x2: this.x + this.fov / 1.85,
                y2: this.y + this.fov / 1.85
            }
        });

        retrieved.forEach(/** @param {Entity} entity */ entity => {
            switch (entity.type) {
                case ENTITY_TYPES.PLAYER: {
                    if (!this.playerCache.has(entity.id)) {
                        const cache = new PlayerClientCache();
                        cache.id = entity.id;
                        cache.name = entity.name;
                        cache.nameColor = entity.nameColor;
                        cache.isNew = true;
                        this.playerCache.set(entity.id, cache);
                    }

                    this.playerCache.get(entity.id).update(entity);
                } break;
                case ENTITY_TYPES.PETAL: {
                    if (!this.petalCache.has(entity.id)) {
                        const cache = new PetalClientCache();
                        cache.id = entity.id;
                        cache.index = entity.index;
                        cache.rarity = entity.rarity;
                        cache.isNew = true;
                        this.petalCache.set(entity.id, cache);
                    }

                    this.petalCache.get(entity.id).update(entity);
                } break;
                case ENTITY_TYPES.MOB: {
                    entity.lastSeen = performance.now();
                    if (!this.mobCache.has(entity.id)) {
                        const cache = new MobClientCache();
                        cache.id = entity.id;
                        cache.index = entity.index;
                        cache.rarity = entity.rarity;;
                        cache.isNew = true;
                        this.mobCache.set(entity.id, cache);
                    }

                    this.mobCache.get(entity.id).update(entity);
                } break;
            }
        });

        this.playerCache.forEach(cache => {
            if (!retrieved.has(cache.id)) {
                writer.setUint32(cache.id);
                writer.setUint8(ENTITY_FLAGS.DIE);
                this.playerCache.delete(cache.id);
                return;
            }

            cache.pipe(writer);
        });

        writer.setUint32(0);

        this.petalCache.forEach(cache => {
            if (!retrieved.has(cache.id)) {
                writer.setUint32(cache.id);
                writer.setUint8(ENTITY_FLAGS.DIE);
                this.petalCache.delete(cache.id);
                return;
            }

            cache.pipe(writer);
        });

        writer.setUint32(0);

        this.mobCache.forEach(cache => {
            if (!retrieved.has(cache.id)) {
                writer.setUint32(cache.id);
                writer.setUint8(ENTITY_FLAGS.DIE);
                this.mobCache.delete(cache.id);
                return;
            }

            cache.pipe(writer);
        });

        writer.setUint32(0);

        this.dropsToAdd.forEach(drop => {
            writer.setUint32(drop.id);
            writer.setFloat32(drop.x);
            writer.setFloat32(drop.y);
            writer.setFloat32(drop.size);
            writer.setUint8(drop.index);
            writer.setUint8(drop.rarity);
            writer.setUint16(drop.duration);
        });

        writer.setUint32(0);

        this.dropsToRemove.forEach(drop => {
            writer.setUint32(drop.id);
        });

        writer.setUint32(0);

        this.dropsToAdd.length = 0;
        this.dropsToRemove.length = 0;

        state.pentagrams.forEach(pentagram => {
            if (!this.markerCache.has(pentagram.id)) {
                const cache = new MarkerClientCache();
                cache.id = pentagram.id;
                cache.isNew = true;
                cache.x = pentagram.x;
                cache.y = pentagram.y;
                cache.size = pentagram.size;
                cache.creation = pentagram.createdAt;
                cache.timer = pentagram.timer;
                this.markerCache.set(pentagram.id, cache);
                cache.pipe(writer);
            }
        });

        this.markerCache.forEach(cache => {
            if (!state.pentagrams.has(cache.id)) {
                cache.kill(writer);
                this.markerCache.delete(cache.id);
            }
        });

        writer.setUint32(0);

        state.lightning.forEach(lightning => {
            if (!this.lightningCache.has(lightning.id)) {
                writer.setUint32(lightning.id);
                writer.setUint16(lightning.points.length);
                for (const point of lightning.points) {
                    writer.setFloat32(point.x);
                    writer.setFloat32(point.y);
                }
                this.lightningCache.add(lightning.id);
            }
        });

        writer.setUint32(0);

        this.lightningCache.forEach(id => {
            if (!state.lightning.has(id)) {
                this.lightningCache.delete(id);
            }
        });
    }
}

class Disconnect {
    /** @param {Client} client  */
    constructor(client) {
        this.uuid = client.uuid;
        this.username = client.username;
        this.level = client.level;
        this.xp = client.xp;
        this.coins = client.coins;
        this.slots = client.slots;
        this.secondarySlots = client.secondarySlots;
        this.body = client.body;
        this.team = client.team;
        this.inventory = client.inventory;
        this.room = RoomManager.roomOf(client.id);

        Client.disconnects.set(this.uuid, this);

        if (this.body) {
            this.body.client = null;
        }

        this.timeout = setTimeout(() => {
            Client.disconnects.delete(this.uuid);

            if (this.body && !this.body.health.isDead) {
                this.body.destroy();
            }
        }, 1000 * 3600 * 24);
    }
}

export default class Client {
    /** @type {Map<number, Client>} */
    static clients = new Map();

    /** @type {Map<number,Disconnect>} */
    static disconnects = new Map();

    static SLOT_UNLOCK_LEVELS = [5, 10, 20, 30, 50];

    constructor(id, uuid, masterPermissions = 0) {
        this.id = id;
        this.verified = false;
        this.username = "unknown";
        this.uuid = uuid;
        this.nameColor = ["#FFFFFF", "#D85555"][+masterPermissions];
        this.masterPermissions = +masterPermissions;
        this.inventory = {};
        this.camera = new Camera();

        /** @type {Player|null} */
        this.body = null;

        state.clients.set(id, this);
        console.log(`Client ${id} connected`);

        this.team = false;
        if (state.isTDM) {
            this.team = 0;
            if (state.teamCount > 0) {
                this.team = ((this.id - 1) % state.teamCount) + 1;
            }
        }

        this.slots = new Array(5).fill(null).map(() => ({ id: 0, rarity: 0 }));
        this.slotRatios = new Array(5).fill(0).map(() => 0);
        this.secondarySlots = new Array(5).fill(null).map(() => null);
        this.level = 1;
        this.xp = 1;
        this.coins = 0;

        this.lastChat = 0;
        this.frownyMessages = 0;
    }

    spawn() {
        this.body = new Player(state.getPlayerSpawn(this));
        this.body.name = this.username;
        this.body.nameColor = this.nameColor;
        this.body.client = this;
        this.body.health.set(this.healthAdjustement);
        this.body.damage = this.bodyDamageAdjustment;
        this.addXP(0);

        this.body.initSlots(this.slots.length);
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i]) {
                this.body.setSlot(i, this.slots[i].id, this.slots[i].rarity);
            }
        }

        this.body.spawnInvincibility = true;

        setTimeout(() => {
            if (this.body) {
                this.body.spawnInvincibility = false;
            }
        }, 2 * 1000);

        if (state.isTDM) {
            this.body.team = -this.team;
        }
        state.alivePlayers.push(this);
    }

    addXP(x) {
        if (!Number.isFinite(x)) {
            return;
        }

        this.xp += x;

        while (this.xp < xpForLevel(this.level - 1)) {
            this.level--;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        while (this.xp >= xpForLevel(this.level)) {
            this.level++;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        let slots = 5 + Client.SLOT_UNLOCK_LEVELS.filter(unlockLevel => this.level >= unlockLevel).length;
        if (slots !== this.slots.length) {
            if (slots > this.slots.length) {
                for (let i = this.slots.length; i < slots; i++) {
                    this.slots.push({ id: 0, rarity: 0 });
                    this.secondarySlots.push(null);
                }
            } else if (slots < this.slots.length)
                for (let i = this.slots.length - 1; i >= slots; i--)
                    for (const { id, rarity } of [this.slots.pop(), this.secondarySlots.pop()].filter(slot => slot !== null))
                        if (this.inventory[tiers[rarity].name][id]) this.inventory[tiers[rarity].name][id]++;
                        else this.inventory[tiers[rarity].name][id] = 1;

            if (this.body && !this.body.health.isDead) this.body.initSlots(slots);
        }

        this.levelProgress = this.level < 2 ? this.xp / xpForLevel(this.level) : (this.xp - xpForLevel(this.level - 1)) / (xpForLevel(this.level) - xpForLevel(this.level - 1));
    }

    get healthAdjustement() {
        return Math.min(11600, 40 + 5 * Math.pow(this.level, 1.5));
    }

    get bodyDamageAdjustment() {
        return Math.min(810, 5 + 1 * Math.pow(this.level, 1.5));
    }

    get highestRarity() {
        let highest = 0;
        for (const slot of this.slots) {
            if (slot && slot.rarity > highest) {
                highest = slot.rarity;
            }
        }

        for (const slot of this.secondarySlots) {
            if (slot && slot.rarity > highest) {
                highest = slot.rarity;
            }
        }

        return highest;
    }

    /** @param {Drop} drop */
    pickupDrop(drop) {
        for (let i = 0; i < this.secondarySlots.length; i++) {
            if (!this.secondarySlots[i]) {
                this.secondarySlots[i] = {
                    id: drop.index,
                    rarity: drop.rarity
                };
                return true;
            }
        }
        const rarity = tiers[drop.rarity].name;
        if (!this.inventory[rarity][drop.index]) {
            this.inventory[rarity][drop.index] = 0;
        }
        this.inventory[rarity][drop.index] += 1;
        return true;
    }

    /**
     * @param {Reader} reader
     */
    onMessage(reader) {
        switch (reader.getUint8()) {
            case SERVER_BOUND.PING:
                this.talk(CLIENT_BOUND.PONG);
                break;
            case SERVER_BOUND.VERIFY:
                if (this.verified) return this.kick("Already verified");

                this.username = reader.getStringUTF8();
                const lowercase = this.username.toLowerCase();
                if (this.username.length > 24 || tripsFilter(lowercase)) return this.kick("Invalid username");

                this.verified = true;
                console.log(`Client ${this.id} verified as ${this.username}`);
                this.talk(CLIENT_BOUND.READY);
                this.sendRoom();
                state.sendTerrain(this.id);
                tiers.forEach(tier => this.inventory[tier.name] = {});

                if (this.uuid === state.secretKey && this.masterPermissions < 1) this.nameColor = "#F5D230";

                const dc = Client.disconnects.get(this.uuid);

                if (dc) {
                    this.level = dc.level;
                    this.xp = dc.xp;
                    this.coins = dc.coins;
                    this.slots = dc.slots;
                    this.secondarySlots = dc.secondarySlots;
                    this.team = dc.team;
                    this.inventory = dc.inventory;
                    this.addXP(0);

                    if (dc.body) {
                        this.body = dc.body;
                        this.body.client = this;
                    }

                    clearTimeout(dc.timeout);
                    Client.disconnects.delete(this.uuid);

                    console.log(`Client ${this.id} reconnected as ${this.username}`);
                }
                state.playerCount++;
                break;
            case SERVER_BOUND.SPAWN:
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                if (this.body && !this.body.health.isDead) {
                    return;
                }

                this.spawn();
                break;
            case SERVER_BOUND.INPUTS: {
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                if (this.body === null) {
                    return;
                }

                const flags = reader.getUint8();

                if ((flags & 0x40) === 0x40 || (flags & 0x80) === 0x80) {
                    this.body.moveAngle = reader.getFloat32();
                    this.body.moveStrength = Math.min(1, Math.max(0, reader.getFloat32())) * this.body.speed;
                } else {
                    let up = (flags & 0x01) === 0x01,
                        left = (flags & 0x02) === 0x02,
                        down = (flags & 0x04) === 0x04,
                        right = (flags & 0x08) === 0x08;

                    let x = -left + right,
                        y = -up + down;

                    if (x === 0 && y === 0) {
                        this.body.moveStrength = 0;
                    } else {
                        this.body.moveAngle = Math.atan2(y, x);
                        this.body.moveStrength = this.body.speed;
                    }
                }

                this.body.attack = (flags & 0x10) === 0x10;
                this.body.defend = (flags & 0x20) === 0x20;
            } break;
            case SERVER_BOUND.CHANGE_LOADOUT: {
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                if (!this.body || this.body.health.isDead) {
                    return;
                }

                const moveeType = reader.getUint8();
                const moveeIndex = reader.getUint8();
                const moverType = reader.getUint8();
                const moverIndex = reader.getUint8();

                switch (moveeType) {
                    case 0: // Slots
                        if (moveeIndex < 0 || moveeIndex >= this.slots.length) {
                            return;
                        }

                        switch (moverType) {
                            case 0: // Slots
                                if (moverIndex < 0 || moverIndex >= this.slots.length) {
                                    return;
                                }

                                const temp = this.slots[moveeIndex];
                                this.slots[moveeIndex] = this.slots[moverIndex];
                                this.slots[moverIndex] = temp;

                                if (this.slots[moveeIndex]) {
                                    this.body.setSlot(moveeIndex, this.slots[moveeIndex].id, this.slots[moveeIndex].rarity);
                                }
                                this.body.setSlot(moverIndex, this.slots[moverIndex].id, this.slots[moverIndex].rarity);
                                break;
                            case 1: // Secondary slots
                                if (moverIndex < 0 || moverIndex >= this.secondarySlots.length) {
                                    return;
                                }

                                const temp2 = this.slots[moveeIndex];
                                this.slots[moveeIndex] = this.secondarySlots[moverIndex];
                                this.secondarySlots[moverIndex] = temp2;

                                if (this.slots[moveeIndex]) {
                                    this.body.setSlot(moveeIndex, this.slots[moveeIndex].id, this.slots[moveeIndex].rarity);
                                }
                                break;
                        }
                        break;
                    case 1: // Secondary slots
                        if (moveeIndex < 0 || moveeIndex >= this.secondarySlots.length || this.secondarySlots[moveeIndex] === null) {
                            return;
                        }

                        switch (moverType) {
                            case 0: // Slots
                                if (moverIndex < 0 || moverIndex >= this.slots.length) {
                                    return;
                                }

                                const temp = this.slots[moverIndex];
                                this.slots[moverIndex] = this.secondarySlots[moveeIndex];
                                this.secondarySlots[moveeIndex] = temp;

                                this.body.setSlot(moverIndex, this.slots[moverIndex].id, this.slots[moverIndex].rarity);
                                break;
                            case 1: // Secondary slots
                                if (moverIndex < 0 || moverIndex >= this.secondarySlots.length || this.secondarySlots[moverIndex] === null) {
                                    return;
                                }

                                const temp2 = this.secondarySlots[moveeIndex];
                                this.secondarySlots[moveeIndex] = this.secondarySlots[moverIndex];
                                this.secondarySlots[moverIndex] = temp2;
                                break;
                            /* case 2: // Destroy
                                this.addXP(Math.pow(this.secondarySlots[moveeIndex].rarity + 1, 2) * 2);
                                this.secondarySlots[moveeIndex] = null;
                                break;
                            */
                        }
                        break;
                }
            }
                if (this.body) {
                    this.body.initSlots(this.slots.length)
                }
                break;
            case SERVER_BOUND.INVENTORY_CHANGE_LOADOUT: {
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                if (!this.body || this.body.health.isDead) {
                    return;
                }

                let moveeIndex = reader.getUint8();
                let moveeRarity = reader.getUint8();
                let moverType = reader.getUint8();
                let moverIndex = reader.getUint8();
                let moverRarity = reader.getUint8();
                let moverPetalIndex = reader.getUint8();

                let inventoryRarity = tiers[moverRarity]?.name;

                switch (moverType) {
                    case 0: // Slots
                        if (!this.inventory[tiers[moveeRarity].name][moveeIndex] || this.slots[moverIndex].id !== moverPetalIndex || this.slots[moverIndex].rarity !== moverRarity) return;
                        if (!this.inventory[inventoryRarity][moverPetalIndex]) {
                            this.inventory[inventoryRarity][moverPetalIndex] = 0;
                        }
                        this.inventory[inventoryRarity][moverPetalIndex] += 1;

                        this.slots[moverIndex].id = moveeIndex;
                        this.slots[moverIndex].rarity = moveeRarity;
                        this.body.setSlot(moverIndex, this.slots[moverIndex].id, this.slots[moverIndex].rarity);

                        this.inventory[tiers[moveeRarity].name][moveeIndex]--;
                        break;
                    case 1: // Secondary slots
                        if (!this.inventory[tiers[moveeRarity].name][moveeIndex] || (moverPetalIndex !== 255 && this.secondarySlots[moverIndex]?.id !== moverPetalIndex || this.secondarySlots[moverIndex]?.rarity !== moverRarity)) return;
                        if (moverPetalIndex === 255) {
                            this.secondarySlots[moverIndex] = {
                                id: moveeIndex,
                                rarity: moveeRarity
                            };
                            this.inventory[tiers[moveeRarity].name][moveeIndex]--;
                            break;
                        }
                        if (!this.inventory[inventoryRarity][moverPetalIndex]) {
                            this.inventory[inventoryRarity][moverPetalIndex] = 0;
                        }
                        this.inventory[inventoryRarity][moverPetalIndex] += 1;

                        this.secondarySlots[moverIndex].id = moveeIndex;
                        this.secondarySlots[moverIndex].rarity = moveeRarity;

                        this.inventory[tiers[moveeRarity].name][moveeIndex]--;
                        break;
                    case 2: // Secondary slot into inventory
                        moverPetalIndex = this.secondarySlots[moverIndex]?.id;
                        inventoryRarity = tiers[this.secondarySlots[moverIndex]?.rarity]?.name

                        if (!this.inventory[inventoryRarity][moverPetalIndex]) {
                            this.inventory[inventoryRarity][moverPetalIndex] = 0;
                        }
                        this.inventory[inventoryRarity][moverPetalIndex] += 1;

                        this.secondarySlots[moverIndex] = null;
                        break;
                }
            }
                break;
            case SERVER_BOUND.DEV_CHEAT: {
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                if (this.masterPermissions < 1 || !this.body || this.body.health.isDead) {
                    return;
                }

                switch (reader.getUint8()) {
                    case DEV_CHEAT_IDS.TELEPORT: {
                        this.body.x += reader.getFloat32();
                        this.body.y += reader.getFloat32();
                    } break;
                    case DEV_CHEAT_IDS.GODMODE: {
                        this.body.health.invulnerable = !this.body.health.invulnerable;
                    } break;
                    case DEV_CHEAT_IDS.CHANGE_TEAM: {
                        const e = state.entities.get(reader.getUint32());

                        if (e) {
                            this.body.team = e.team;
                        }
                    } break;
                    case DEV_CHEAT_IDS.SPAWN_MOB: {
                        const promiseID = reader.getUint32();
                        const index = reader.getUint8();
                        const rarity = reader.getUint8();

                        if (index < 0 || index >= petalConfigs.length) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Index out of range"
                            });
                        }

                        if (rarity < 0 || rarity >= tiers.length) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Rarity out of range"
                            });
                        }

                        const mob = new Mob(state.random());
                        mob.define(mobConfigs[index], rarity);
                        this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                            promiseID: promiseID,
                            ok: true,
                            mob: {
                                id: mob.id,
                                index: index,
                                rarity: rarity,
                                position: {
                                    x: mob.x,
                                    y: mob.y
                                }
                            }
                        });
                    } break;
                    case DEV_CHEAT_IDS.SET_PETAL: {
                        const promiseID = reader.getUint32();
                        const clientID = reader.getUint32();
                        const slotID = reader.getUint8();
                        const index = reader.getUint8();
                        const rarity = reader.getUint8();

                        const client = state.clients.get(clientID);
                        if (!client) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Client not found"
                            });
                        }

                        if (slotID < 0 || slotID >= client.slots.length) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Slot not found"
                            });
                        }

                        if (index < 0 || index >= petalConfigs.length) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Index out of range"
                            });
                        }

                        if (rarity < 0 || rarity >= tiers.length) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Rarity out of range"
                            });
                        }

                        client.slots[slotID] = { id: index, rarity };

                        if (client.body) {
                            client.body.setSlot(slotID, index, rarity);
                        }

                        this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                            promiseID: promiseID,
                            ok: true,
                            message: "Petal set"
                        });
                    } break;
                    case DEV_CHEAT_IDS.SET_XP: {
                        const promiseID = reader.getUint32();
                        const clientID = reader.getUint32();
                        const xp = reader.getUint32();

                        const client = state.clients.get(clientID);
                        if (!client) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Client not found"
                            });
                        }

                        client.addXP(xp - client.xp);
                        this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                            promiseID: promiseID,
                            ok: true,
                            message: "XP set"
                        });
                    } break;
                    case DEV_CHEAT_IDS.INFO_DUMP: {
                        this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                            promiseID: reader.getUint32(),
                            ok: true,
                            entitiesSize: state.entities.size,
                            clients: Array.from(state.clients.values()).map(client => ({
                                id: client.id,
                                username: client.username,
                                verified: client.verified,
                                masterPermissions: client.masterPermissions,
                                team: client.team,
                                level: client.level,
                                xp: client.xp
                            })),
                            key: state.secretKey
                        });
                    } break;
                }
            } break;
            case SERVER_BOUND.CHAT_MESSAGE: {
                if (!this.verified) {
                    this.kick("Not verified");
                    return;
                }

                const message = reader.getStringUTF8();
                if (!/^[\w\s,.!?'"@#%^&*()_\-+=:;<>\/\\|[\]{}~`\u00A0-\uFFFF]{1,128}$/.test(message)) {
                    this.systemMessage("That message is too long or contains invalid characters", "#FF6666");
                    this.frownyMessages++;

                    if (this.frownyMessages >= 5) {
                        this.kick("Abusing chat");
                    }
                    return;
                }

                if (message.startsWith("/")) {
                    if (performance.now() - this.lastChat < 500) {
                        this.systemMessage("You're chatting too fast", "#22CACA");
                        return;
                    }
                    this.lastChat = performance.now();
                    this.handleCommand(message.slice(1));
                    return;
                }

                if (message.length > 10) {
                    const setOfChars = new Set(message);
                    const split = message.split("");
                    for (const char of setOfChars) {
                        if (split.filter(c => c === char).length > message.length / 3) {
                            this.systemMessage("Please refrain from spamming", "#22CACA");
                            this.frownyMessages++;

                            if (this.frownyMessages >= 5) {
                                this.kick("Abusing chat");
                            }
                            return;
                        }
                    }
                }

                if (tripsFilter(message)) {
                    this.systemMessage("Please refrain from saying slurs", "#CA2222");
                    this.frownyMessages++;

                    if (this.frownyMessages >= 5) {
                        this.kick("Abusing chat");
                    }
                    return;
                }

                if (performance.now() - this.lastChat < 500) {
                    this.systemMessage("You're chatting too fast", "#22CACA");
                    return;
                }

                this.lastChat = performance.now();
                state.clients.forEach(c => c.chatMessage(this.username, message, this.nameColor));
            } break;
        }
    }

    /**
     * @param {string}
     */
    handleCommand(body) {
        const args = body.trim().split(/\s+/).filter(Boolean);
        const commandName = (args.shift() ?? "").toLowerCase();

        switch (commandName) {
            case "help":
                this.commandHelp(args);
                break;
            case "online":
                this.commandOnline();
                break;
            case "give":
                this.commandGive(args);
                break;
            case "craft":
                this.commandCraft(args);
                break;
            case "merge":
                this.commandMerge(args);
                break;
            case "shop":
                this.commandShop(args);
                break;
            case "oracle":
                this.commandOracle(args);
                break;
            case "room":
                this.commandRoom(args);
                break;
            default:
                this.systemMessage(`Unknown command. Try /help.`, "#FF6666");
                break;
        }
    }

    commandHelp(args) {
        const topic = (args[0] ?? "").toLowerCase();
        switch (topic) {
            case "oracle":
                this.systemMessage("/oracle commands:", "#9682c7");
                this.systemMessage("/oracle craft <rarity> <petal> - spend that rarity to get the next one", "#9682c7");
                this.systemMessage("7 Common | 11 Unusual | 19 Rare | 34 Epic", "#9682c7");
                this.systemMessage("65 Legendary | 128 Mythic | 253 Ultra | 2503 Super", "#9682c7");
                this.systemMessage("Example: /oracle craft common rose - 7 Common Rose -> 1 Unusual Rose", "#9682c7");
                break;
            case "craft":
                this.systemMessage("/craft commands:", "#d19a57");
                this.systemMessage("/craft <rarity> <petal> [amount] - craft a petal", "#d19a57");
                this.systemMessage("/craft <rarity> all - craft all petals of that rarity", "#d19a57");
                this.systemMessage("Example: /craft common leaf 5", "#d19a57");
                this.systemMessage("Example: /craft rare ant egg all", "#d19a57");
                break;
            case "merge":
                this.systemMessage("/merge commands:", "#1ea660");
                this.systemMessage("/merge list - list all merge recipes", "#1ea660");
                this.systemMessage("/merge craft <rarity> <petal> [amount|all] - merge ingredients into the named petal", "#1ea660");
                this.systemMessage("Example: /merge craft unusual sawblade all", "#1ea660");
                break;
            case "shop":
                this.systemMessage("/shop commands:", "#ffe763");
                this.systemMessage("/shop list - list petals available and their Coin prices", "#ffe763");
                this.systemMessage("/shop coin <rarity> <petal> [count] - convert petals into Coins of that rarity", "#ffe763");
                this.systemMessage("/shop buy <rarity> <petal> - spend Coins of that rarity to buy petal at that rarity", "#ffe763");
                this.systemMessage("Example: /shop buy mythic pearl - spends Mythic Coins, gives Mythic Pearl", "#ffe763");
                break;
            case "room":
                this.systemMessage("/room commands:", "#7ea6ef");
                this.systemMessage("/room list - list all available rooms", "#7ea6ef");
                this.systemMessage("/room join <name> - join the named room", "#7ea6ef");
                this.systemMessage("/room back - return to the room you were in before", "#7ea6ef");
                this.systemMessage("Example: /room join garden-main", "#7ea6ef");
                break;
            default:
                this.systemMessage("/squad - manage your squad...", "#ffe763");
                this.systemMessage("/craft - crafts 5 petals into a higher rarity", "#ffe763");
                this.systemMessage("/merge - combine ingredients to create new petals", "#ffe763");
                this.systemMessage("/shop - sell petals for coin or buy petals via coins", "#ffe763");
                this.systemMessage("/oracle - combine certain amount of petals for upgraded petal", "#ffe763");
                this.systemMessage("/room - list, join, or return between rooms", "#ffe763");
                break;
        }
    }

    commandOnline() {
        const total = RoomManager.rooms.reduce((sum, room) => sum + room.clientCount, 0);
        this.systemMessage(`There are currently ${total} player(s) online.`, "#7EEF6D");
    }

    commandRoom(args) {
        const sub = (args[0] ?? "").toLowerCase();

        switch (sub) {
            case "list":
                this.commandRoomList();
                break;
            case "join":
                this.commandRoomJoin(args.slice(1));
                break;
            case "back":
                this.commandRoomBack();
                break;
            default:
                this.systemMessage("Usage: /room list | /room join <name> | /room back", "#7ea6ef");
                break;
        }
    }

    commandRoomList() {
        const names = RoomManager.rooms.map(room => `${room.name} (${room.clientCount}/${room.isFull ? "full" : "open"})`);
        this.systemMessage(`Rooms: ${names.join(", ")}`, "#7ea6ef");
    }

    commandRoomJoin(args) {
        const name = args.join(" ");

        if (!name) {
            this.systemMessage("Usage: /room join <name>", "#FF6666");
            return;
        }

        const target = RoomManager.findByName(name);

        if (!target) {
            this.systemMessage(`Room "${name}" was not found. Try /room list.`, "#FF6666");
            return;
        }

        RoomManager.moveClient(this, target);
    }

    commandRoomBack() {
        const previous = RoomManager.previousRoom.get(this.id);

        if (!previous) {
            this.systemMessage("There's no previous room to go back to.", "#FF6666");
            return;
        }

        RoomManager.moveClient(this, previous);
    }

    commandGive(args) {
        if (this.masterPermissions < 1) {
            this.systemMessage("You do not have permission to use this command", "#FF6666");
            return;
        }

        if (args.length < 3) {
            this.systemMessage("Usage: /give <player> <rarity> <petal> [amount]", "#FF6666");
            return;
        }

        const targetName = args[0];
        const target = findClientByUsername(targetName);
        if (!target) {
            this.systemMessage(`Player "${targetName}" was not found.`, "#FF6666");
            return;
        }

        const parsed = parseRarityPetalAmount(args.slice(1));
        if (!parsed) {
            this.systemMessage("Could not parse rarity/petal. Usage: /give <player> <rarity> <petal> [amount]", "#FF6666");
            return;
        }

        const { rarityIndex, petalIndex, amount } = parsed;
        const rarityName = tiers[rarityIndex].name;
        const petalName = petalConfigs[petalIndex].name;

        if (!target.inventory[rarityName]) target.inventory[rarityName] = {};
        target.inventory[rarityName][petalIndex] = (target.inventory[rarityName][petalIndex] ?? 0) + amount;

        this.systemMessage(`Gave ${amount}x ${rarityName} ${petalName} to ${target.username}.`, "#7EEF6D");
        target.systemMessage(`${this.username} gave you ${amount}x ${rarityName} ${petalName}.`, "#7EEF6D");
    }

    commandCraft(args) {
        const rarityName = args[0]?.toLowerCase();
        if (!rarityName || args.length < 2) {
            this.systemMessage("Usage: /craft <rarity> <petal|all> [amount|all]", "#d19a57");
            return;
        }

        const s = findTierIndexByName(rarityName);
        if (s === -1) {
            this.systemMessage(`Unknown rarity: ${rarityName}`, "#FF6666");
            return;
        }

        const n = s + 1;
        if (n >= tiers.length) {
            this.systemMessage("Cannot craft beyond max rarity", "#FF6666");
            return;
        }

        const r = tiers[s].name;
        const l = tiers[n].name;
        const chance = craftSuccessChance(s);
        const color = tiers[n].color ?? "#d19a57";

        const attempt = petalIndex => {
            if (Math.random() < chance) {
                this.inventory[r][petalIndex] -= 5;
                if (!this.inventory[l]) this.inventory[l] = {};
                this.inventory[l][petalIndex] = (this.inventory[l][petalIndex] ?? 0) + 1;
                broadcastAll(`${this.username} crafted an ${l} ${petalConfigs[petalIndex]?.name ?? `#${petalIndex}`}!`, color);
                return { crafted: 1, consumed: 5 };
            } else {
                const lost = Math.min(Math.floor(4 * Math.random()) + 1, this.inventory[r][petalIndex]);
                this.inventory[r][petalIndex] -= lost;
                return { crafted: 0, consumed: lost };
            }
        };

        const last = args[args.length - 1]?.toLowerCase();
        const hasAmountArg = last === "all" || /^\d+$/.test(last);

        if (last === "all" && args.length === 2) {
            const eligible = Object.keys(this.inventory[r] ?? {})
                .map(Number)
                .filter(i => (this.inventory[r][i] ?? 0) >= 5);

            if (eligible.length === 0) {
                this.systemMessage(`No ${r} petals with ${5}+ to craft`, "#FF6666");
                return;
            }

            let crafted = 0, consumed = 0;
            for (const petalIndex of eligible) {
                while ((this.inventory[r][petalIndex] ?? 0) >= 5) {
                    const result = attempt(petalIndex);
                    crafted += result.crafted;
                    consumed += result.consumed;
                }
            }

            this.systemMessage(`Mass craft done: ${crafted} crafted | ${consumed} consumed`, color);
            return;
        }

        const petalArgs = hasAmountArg ? args.slice(1, -1) : args.slice(1);
        const petalName = petalArgs.join(" ").toLowerCase();
        if (!petalName) {
            this.systemMessage("Usage: /craft <rarity> <petal|all> [amount|all]", "#d19a57");
            return;
        }

        let targets = [];
        if (petalName === "all") {
            targets = Object.keys(this.inventory[r] ?? {})
                .map(Number)
                .filter(i => (this.inventory[r][i] ?? 0) >= 5);
        } else {
            const petalIndex = findPetalIndexByName(petalName);
            if (petalIndex === -1) {
                this.systemMessage(`Unknown petal: ${petalName}`, "#FF6666");
                return;
            }
            targets = [petalIndex];
        }

        if (targets.length === 0) {
            this.systemMessage(`No petals available to craft, need at least ${5}`, "#FF6666");
            return;
        }

        const amountArg = hasAmountArg ? last : undefined;
        let totalCrafted = 0, totalConsumed = 0;
        for (const petalIndex of targets) {
            const petalName2 = petalConfigs[petalIndex]?.name ?? `#${petalIndex}`;
            const have = this.inventory[r]?.[petalIndex] ?? 0;
            if (have < 5) {
                if (petalName !== "all") {
                    this.systemMessage(`Not enough ${r} ${petalName2} to craft, need ${5}, have ${have}`, "#FF6666");
                }
                continue;
            }

            let maxAttempts = Infinity;
            if (amountArg !== undefined && amountArg !== "all") {
                maxAttempts = Math.max(1, Math.min(9999, parseInt(amountArg, 10)));
            }

            let attempts = 0, crafted = 0, consumed = 0;
            while ((this.inventory[r]?.[petalIndex] ?? 0) >= 5 && attempts < maxAttempts) {
                attempts++;
                const result = attempt(petalIndex);
                crafted += result.crafted;
                consumed += result.consumed;
            }
            totalCrafted += crafted;
            totalConsumed += consumed;
        }

        if (petalName === "all") {
            this.systemMessage(`Mass craft done: ${totalCrafted} crafted | ${totalConsumed} consumed`, color);
        }
    }

    commandShop(args) {
        const sub = args[0]?.toLowerCase();

        if (!this.body || this.body.health.isDead) {
            this.systemMessage("You must be alive to use this command", "#FF6666");
            return;
        }

        if (!isNearMob(this, "Trader")) {
            this.systemMessage("You must be near the Trader to use /shop!", "#ffe763");
            return;
        }

        const coinIndex = findPetalIndexByName("Coin");
        const totalCoins = () => {
            if (coinIndex === -1) return 0;
            let total = 0;
            for (const rarityName of Object.keys(this.inventory ?? {})) {
                total += this.inventory[rarityName]?.[coinIndex] ?? 0;
            }
            return total;
        };

        switch (sub) {

            case "list":
                this.systemMessage("Shop catalogue:", "#efd85a");
                this.systemMessage("Costs that many Coins of the chosen rarity", "#ffe763");
                for (const entry of SHOP_CATALOG) {
                    this.systemMessage(`${entry.petal} - ${entry.price} Coins (matching rarity)`, "#ffe763");
                }
                this.systemMessage(`Your total Coins: ${totalCoins()}`, "#ffe763");
                return;

            case "coin": {
                const rarityArg = args[1]?.toLowerCase();
                if (!rarityArg || args.length < 3) {
                    this.systemMessage("Usage: /shop coin <rarity> <petal> [count]", "#ffe763");
                    return;
                }

                const rarityIndex = findTierIndexByName(rarityArg);
                if (rarityIndex === -1) {
                    this.systemMessage(`Unknown rarity: ${args[1]}`, "#FF6666");
                    return;
                }

                const last = args[args.length - 1];
                const hasCount = /^\d+$/.test(last) && args.length > 3;
                const count = hasCount ? Math.max(1, parseInt(last, 10)) : 1;
                const petalName = (hasCount ? args.slice(2, -1) : args.slice(2)).join(" ").toLowerCase().trim();
                if (!petalName) {
                    this.systemMessage("Usage: /shop coin <rarity> <petal> [count]", "#ffe763");
                    return;
                }

                const petalIndex = findPetalIndexByName(petalName);
                if (petalIndex === -1) {
                    this.systemMessage(`Unknown petal: ${petalName}`, "#FF6666");
                    return;
                }

                const rarityName = tiers[rarityIndex].name;
                const have = this.inventory[rarityName]?.[petalIndex] ?? 0;
                if (have < count) {
                    this.systemMessage(`Not enough ${rarityName} ${petalConfigs[petalIndex]?.name}. Need ${count}, have ${have}`, "#FF6666");
                    return;
                }

                if (coinIndex === -1) {
                    this.systemMessage("Coin petal not found on this server", "#FF6666");
                    return;
                }

                this.inventory[rarityName][petalIndex] -= count;
                this.inventory[rarityName][coinIndex] = (this.inventory[rarityName][coinIndex] ?? 0) + count;

                const color = tiers[rarityIndex].color ?? "#ffe763";
                this.systemMessage(`Converted ${count} ${rarityName} ${petalConfigs[petalIndex]?.name} -> ${count} ${rarityName} Coins!`, color);
                broadcastAll(`${this.username} sold an ${rarityName} ${petalConfigs[petalIndex]?.name} for ${rarityName} Coin!`, color);
                return;
            }

            case "buy": {
                const rarityArg = args[1]?.toLowerCase();
                if (!rarityArg || args.length < 3) {
                    this.systemMessage("Usage: /shop buy <rarity> <petal>", "#ffe763");
                    return;
                }

                const petalName = args.slice(2).join(" ").toLowerCase().trim();
                const catalogEntry = SHOP_CATALOG.find(e => e.petal.toLowerCase() === petalName);
                if (!catalogEntry) {
                    this.systemMessage(`"${petalName}" is not in the shop. Use /shop list to see available petals`, "#FF6666");
                    return;
                }

                const rarityIndex = findTierIndexByName(rarityArg);
                if (rarityIndex === -1) {
                    this.systemMessage(`Unknown rarity: ${args[1]}`, "#FF6666");
                    return;
                }

                const rarityName = tiers[rarityIndex].name;
                const petalIndex = findPetalIndexByName(catalogEntry.petal);
                if (petalIndex === -1 || coinIndex === -1) {
                    this.systemMessage("Internal shop error: petal not found", "#FF6666");
                    return;
                }

                const haveCoins = this.inventory[rarityName]?.[coinIndex] ?? 0;
                if (haveCoins < catalogEntry.price) {
                    this.systemMessage(`Not enough ${rarityName} Coins. Need ${catalogEntry.price}, you have ${haveCoins}`, "#FF6666");
                    return;
                }

                if (!this.inventory[rarityName]) this.inventory[rarityName] = {};
                this.inventory[rarityName][coinIndex] -= catalogEntry.price;
                this.inventory[rarityName][petalIndex] = (this.inventory[rarityName][petalIndex] ?? 0) + 1;

                const color = tiers[rarityIndex].color ?? "#ffe763";
                this.systemMessage(`Purchased 1x ${rarityName} ${catalogEntry.petal} for ${catalogEntry.price} ${rarityName} Coins! Remaining ${rarityName} Coins: ${this.inventory[rarityName][coinIndex]}`, color);
                broadcastAll(`${this.username} bought an ${rarityName} ${catalogEntry.petal}!`, color);
                return;
            }

            default:
                this.systemMessage("/shop - list | coin <rarity> <petal> [count] | buy <rarity> <petal>", "#ffe763");
        }
    }

    commandOracle(args) {
        const color = "#9682c7";
        if (!this.body || this.body.health.isDead) {
            this.systemMessage("You must be alive to use this command", "#FF6666");
            return;
        }

        if (!isNearMob(this, "Oracle")) {
            this.systemMessage("You can only use /oracle near the Oracle!", color);
            return;
        }

        const sub = args[0]?.toLowerCase();
        switch (sub) {

            case "craft": {
                const rarityArg = args[1]?.toLowerCase();
                if (!rarityArg || args.length < 3) {
                    this.systemMessage("Usage: /oracle craft <rarity> <petal>", color);
                    return;
                }

                const a = findTierIndexByName(rarityArg);
                if (a === -1) {
                    this.systemMessage(`Unknown rarity: ${rarityArg}`, "#FF6666");
                    return;
                }

                const nextIndex = a === 7 ? 9 : a + 1;
                const cost = ORACLE_RATES[a] ?? 7;
                const rarityName = tiers[a].name;
                const petalName = args.slice(2).join(" ").toLowerCase();
                if (!petalName) {
                    this.systemMessage("Usage: /oracle craft <rarity> <petal>", color);
                    return;
                }

                const petalIndex = findPetalIndexByName(petalName);
                if (petalIndex === -1) {
                    this.systemMessage(`Unknown petal: ${petalName}`, "#FF6666");
                    return;
                }

                const have = this.inventory[rarityName]?.[petalIndex] ?? 0;
                if (have < cost) {
                    this.systemMessage(`Not enough ${rarityName} ${petalConfigs[petalIndex].name}. Need ${cost}, have ${have}`, "#FF6666");
                    return;
                }

                this.inventory[rarityName][petalIndex] -= cost;
                const nextRarityName = tiers[nextIndex].name;
                if (!this.inventory[nextRarityName]) this.inventory[nextRarityName] = {};
                this.inventory[nextRarityName][petalIndex] = (this.inventory[nextRarityName][petalIndex] ?? 0) + 1;

                broadcastAll(`${this.username} crafted an ${nextRarityName} ${petalConfigs[petalIndex]?.name}!`, color);
                this.systemMessage(`Oracle success! ${cost} ${rarityName} ${petalConfigs[petalIndex].name} -> 1 ${nextRarityName} ${petalConfigs[petalIndex].name}`, color);
                return;
            }

            default:
                this.systemMessage("/oracle - craft <rarity> <petal>", color);
        }
    }

    commandMerge(args) {
        const sub = args[0]?.toLowerCase();

        if (!this.body || this.body.health.isDead) {
            this.systemMessage("You must be alive to use this command", "#FF6666");
            return;
        }

        if (!isNearMob(this, "Druid")) {
            this.systemMessage("You can only merge near the Druid!", "#FF6666");
            return;
        }

        if (sub === "list") {
            this.systemMessage("Merge recipes | output - ingredients:", "#18864d");
            for (const recipe of MERGE_RECIPES) {
                const ingredients = recipe.inputs
                    .map(inp => `${petalConfigs[findPetalIndexByName(inp.petal)]?.name ?? inp.petal} ${inp.count}x`)
                    .join(", ");
                this.systemMessage(`${recipe.output} - ${ingredients}`, "#1ea660");
            }
            return;
        }

        if (sub !== "craft") {
            this.systemMessage("Usage: /merge - /merge list | /merge craft <rarity> <petal> [amount|all]", "#1ea660");
            return;
        }

        const rarityArg = args[1]?.toLowerCase();
        if (!rarityArg || args.length < 3) {
            this.systemMessage("Usage: /merge craft <rarity> <petal> [amount|all]", "#1ea660");
            return;
        }

        const g = findTierIndexByName(rarityArg);
        if (g === -1) {
            this.systemMessage(`Unknown rarity "${args[1]}". Usage: /merge craft <rarity> <petal> [amount|all]`, "#FF6666");
            return;
        }

        const last = args[args.length - 1]?.toLowerCase();
        const hasAmount = last === "all" || /^\d+$/.test(last);
        const petalArgs = hasAmount ? args.slice(2, -1) : args.slice(2);
        const outputName = petalArgs.join(" ").toLowerCase().trim();
        if (!outputName) {
            this.systemMessage("Usage: /merge craft <rarity> <petal> [amount|all]", "#1ea660");
            return;
        }

        let isAll = false, amount = 1;
        if (hasAmount) {
            if (last === "all") isAll = true;
            else amount = Math.max(1, Math.min(9999, parseInt(last, 10)));
        }

        const matching = MERGE_RECIPES.filter(r => r.output.toLowerCase() === outputName);
        if (matching.length === 0) {
            this.systemMessage(`No merge recipe produces "${outputName}"`, "#FF6666");
            return;
        }

        const rarityName = tiers[g].name;
        const inv = this.inventory;
        let best = null, bestInputIndices = null, bestCount = 0;
        for (const recipe of matching) {
            const inputIndices = recipe.inputs.map(inp => findPetalIndexByName(inp.petal));
            if (inputIndices.some(i => i === -1)) continue;

            const craftable = Math.min(...recipe.inputs.map((inp, i) =>
                Math.floor((inv[rarityName]?.[inputIndices[i]] ?? 0) / inp.count)
            ));
            if (best === null || craftable > bestCount) {
                best = recipe;
                bestInputIndices = inputIndices;
                bestCount = craftable;
            }
        }

        if (!best) {
            this.systemMessage("Unknown petal name in recipe", "#FF6666");
            return;
        }

        const outputIndex = findPetalIndexByName(best.output);
        if (outputIndex === -1) {
            this.systemMessage("Unknown petal name in recipe", "#FF6666");
            return;
        }

        const craftCount = isAll ? bestCount : Math.min(bestCount, amount);
        if (craftCount <= 0) {
            this.systemMessage("Not enough petals to merge!", "#FF6666");
            best.inputs.forEach((inp, i) => {
                const have = inv[rarityName]?.[bestInputIndices[i]] ?? 0;
                this.systemMessage(`Need: ${inp.count} ${petalConfigs[bestInputIndices[i]]?.name ?? inp.petal}, have ${have}`, "#FF6666");
            });
            return;
        }

        if (!inv[rarityName]) inv[rarityName] = {};
        best.inputs.forEach((inp, i) => {
            const idx = bestInputIndices[i];
            inv[rarityName][idx] -= inp.count * craftCount;
            if (inv[rarityName][idx] <= 0) delete inv[rarityName][idx];
        });
        inv[rarityName][outputIndex] = (inv[rarityName][outputIndex] ?? 0) + craftCount;

        const outputPetalName = petalConfigs[outputIndex]?.name ?? best.output;
        const color = tiers[g].color ?? "#1ea660";
        const consumedText = best.inputs
            .map((inp, i) => `${inp.count * craftCount} ${petalConfigs[bestInputIndices[i]]?.name ?? inp.petal}`)
            .join(" + ");
        this.systemMessage(`Merged ${consumedText} > ${craftCount} ${outputPetalName}!`, color);
        for (let i = 0; i < craftCount; i++) {
            broadcastAll(`${this.username} merged an ${rarityName} ${outputPetalName}!`, color);
        }
    }

    chatMessage(username, message, color) {
        this.talk(CLIENT_BOUND.CHAT_MESSAGE, {
            type: 0,
            username: username,
            message: message,
            color: color
        });
    }

    systemMessage(message, color) {
        this.talk(CLIENT_BOUND.CHAT_MESSAGE, {
            type: 1,
            message: message,
            color: color
        });
    }

    talk(type, data) {
        const writer = new Writer(true);
        writer.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
        writer.setUint16(this.id);
        writer.setUint8(type);

        switch (type) {
            case CLIENT_BOUND.KICK: // Kick packet
            case CLIENT_BOUND.DEATH: // Death packet
                writer.setStringUTF8(data);
                break;
            case CLIENT_BOUND.ROOM_UPDATE: // Room update packet
                writer.setFloat32(data.width);
                writer.setFloat32(data.height);
                writer.setUint8(data.isRadial ? 1 : 0);
                writer.setUint8(data.biome);
                break;
            case CLIENT_BOUND.JSON_MESSAGE: // JSON message packet
                writer.setStringUTF8(JSON.stringify(data));
                break;
            case CLIENT_BOUND.CHAT_MESSAGE: // Chat message packet
                writer.setUint8(data.type);

                if (data.type === 0) {
                    writer.setStringUTF8(data.username);
                }

                writer.setStringUTF8(data.message);
                writer.setStringUTF8(data.color);
                break;
        }

        state.router.postMessage(writer.build());
    }

    onClose() {
        if (this.verified) {
            console.log(`Client ${this.id} (${this.username}) disconnected.`);
            // if (this.body /* && !this.body.health.isDead && this.level >= 20 */) {
            new Disconnect(this);
            // } else 
            this.body?.destroy();
            // }
        } else {
            console.log(`Client ${this.id} disconnected`);
        }

        state.alivePlayers = state.alivePlayers.filter(m => m.id !== this.id);
        state.playerCount = Math.max(0, state.playerCount - 1);
        state.clients.delete(this.id);
    }

    terminate() {
        state.router.postMessage(new Uint8Array([ROUTER_PACKET_TYPES.CLOSE_CLIENT, this.id]));
    }

    kick(reason = "Unknown Reason") {
        this.talk(CLIENT_BOUND.KICK, reason);
        this.body?.destroy();
        this.terminate();
    }

    worldUpdate() {
        if (!this.verified) {
            return;
        }

        if (this.body !== null) {
            this.camera.x = this.body.x;
            this.camera.y = this.body.y;
            this.camera.fov = 1256 + this.body.extraVision;

            this.slotRatios = [];

            for (let i = 0; i < this.body.petalSlots.length; i++) {
                this.slotRatios.push(this.body.petalSlots[i].displayRatio);
            }
        }

        const writer = new Writer(true);
        writer.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
        writer.setUint16(this.id);
        writer.setUint8(CLIENT_BOUND.WORLD_UPDATE);

        writer.setFloat32(this.camera.x);
        writer.setFloat32(this.camera.y);
        writer.setFloat32(this.camera.fov);
        writer.setUint8(this.camera.lightingBoost);
        writer.setUint32(this.body ? this.body.id : 0);

        this.camera.see(writer);

        // GUI
        writer.setUint8(this.slots.length);
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            writer.setUint8(slot ? 1 : 0);

            if (slot) {
                writer.setUint8(slot.id);
                writer.setUint8(slot.rarity);
                writer.setFloat32(this.slotRatios[i] ?? 0);
            }
        }

        writer.setUint8(this.secondarySlots.length);
        for (let i = 0; i < this.secondarySlots.length; i++) {
            const slot = this.secondarySlots[i];
            writer.setUint8(slot ? 1 : 0);

            if (slot) {
                writer.setUint8(slot.id);
                writer.setUint8(slot.rarity);
            }
        }

        if (state.isWaves) {
            writer.setUint8(1);
            writer.setUint16(state.currentWave);
            writer.setUint16(state.livingMobCount);
            writer.setUint16(state.maxMobs);
            writer.setUint16(state.aliveMobs.length);

            for (const entity of state.aliveMobs) {
                writer.setUint8(entity.index);
                writer.setUint8(entity.rarity);
            }
        } else {
            writer.setUint8(0);
        }

        writer.setUint8(state.alivePlayers.length);
        for (const entity of state.alivePlayers) {
            writer.setUint8(entity.team);
            writer.setUint8(entity.highestRarity);
            writer.setFloat32(entity.xp / 10000);
            writer.setStringUTF8(entity.username);
        }

        writer.setUint8(state.playerCount);

        writer.setUint16(this.level);
        writer.setFloat32(this.levelProgress);
        tiers.forEach(tier => {
            const petals = this.inventory[tier.name];
            const petalIds = Object.keys(petals);
            writer.setUint16(petalIds.length);
            petalIds.forEach(id => {
                writer.setUint16(parseInt(id));
                writer.setUint16(petals[id]);
            });
        });

        state.router.postMessage(writer.build());

        const minimapWriter = new Writer(true);
        minimapWriter.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
        minimapWriter.setUint16(this.id);
        minimapWriter.setUint8(112);

        const players = [];

        for (const [, obj] of state.entities) {
            if (!obj) continue;
            if (obj.type !== ENTITY_TYPES.PLAYER) continue;

            players.push(obj);
        }

        minimapWriter.setUint16(players.length);

        for (const player of players) {
            minimapWriter.setUint32(player.id ?? 0);
            minimapWriter.setFloat32(Number(player.x) || 0);
            minimapWriter.setFloat32(Number(player.y) || 0);
        }

        state.router.postMessage(minimapWriter.build());

        if (globalThis._MAP_CELLS?.length) {
            this.__sentTerrainScores ??= false;

            if (!this.__sentTerrainScores) {
                this.__sentTerrainScores = true;

                const cells = globalThis._MAP_CELLS ?? [];

                const terrainWriter = new Writer(true);

                terrainWriter.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
                terrainWriter.setUint16(this.id);
                terrainWriter.setUint8(113);

                terrainWriter.setUint32(cells.length);

                for (const cell of cells) {
                    terrainWriter.setUint16(cell.x);
                    terrainWriter.setUint16(cell.y);
                    terrainWriter.setFloat32(cell.score ?? 0);
                }

                state.router.postMessage(terrainWriter.build());
            }
        }
    }

    sendRoom() {
        this.talk(CLIENT_BOUND.ROOM_UPDATE, state);
    }

    /** @param {Drop} drop */
    addDrop(drop) {
        this.camera.dropsToAdd.push(drop);
    }

    /** @param {Drop} drop */
    removeDrop(drop) {
        this.camera.dropsToRemove.push(drop);
    }
}