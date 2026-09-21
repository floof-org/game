import state from "./state.js";
import { Entity, Mob, Player } from "./Entity.js";
import { Reader, Writer, CLIENT_BOUND, ENTITY_FLAGS, ENTITY_MODIFIER_FLAGS, ROUTER_PACKET_TYPES, SERVER_BOUND, ENTITY_TYPES, DEV_CHEAT_IDS, WEARABLES } from "../../lib/protocol.js";
import { mobConfigs, petalConfigs, petalIDOf, tiers } from "./config.js";
import { colors, formatLargeNumber } from "../../lib/util.js";

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

        // First loop: Check for Leeches that are only partially visible
        if (state.isBiomeGrid) {
            retrieved.forEach(entity => {
                // If the player sees any segment of a Leech, they should see the full Leech.
                // This requires seeing the Leech's head, which contains all of the Leech's data.
                if (entity.config?.name === "Leech" && entity !== entity.parent) {
                    retrieved.set(entity.parent.id, entity.parent);
                    retrieved.delete(entity.id);
                }
            })
        }

        // Second loop: Update all data that needs to be sent to client
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
        this.userId = client.userId;
        this.username = client.username;
        this.level = client.level;
        this.xp = client.xp;
        this.slots = client.slots;
        this.secondarySlots = client.secondarySlots;
        this.body = client.body;
        this.team = client.team;
        this.inventory = client.inventory;
        this.maxKilledRarity = client.maxKilledRarity;

        Client.disconnects.set(this.userId, this);

        if (this.body) {
            this.body.client = null;
        }

        this.timeout = setTimeout(() => {
            Client.disconnects.delete(this.userId);

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

    constructor(id, userId, masterPermissions = 0) {
        this.id = id;
        this.verified = false;
        this.username = "unknown";
        this.userId = userId;
        this.nameColor = ["#FFFFFF", "#D85555"][+masterPermissions];
        this.masterPermissions = +masterPermissions;
        this.inventory = {};
        this.camera = new Camera();
        this.sentTerrain = false;
        this.sentBiome = undefined;
        this.maxKilledRarity = 0;

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
        if (state.isBiomeGrid) {
            this.secondarySlots[0] = { id: petalIDOf("Gallery"), rarity: 0 };
            this.xp = state.xpForLevel(0) + 0.00001;
        }

        this.lastChat = 0;
        this.frownyMessages = 0;

        if (state.isBiomeGrid) {
            this.aliveTimer = 0;
            this.afk = false;
            this.afkTime = 0;
        }
    }

    addXP(x) {
        if (!Number.isFinite(x)) {
            return;
        }

        this.xp += x;

        while (this.xp < state.xpForLevel(this.level - 1)) {
            this.level--;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        while (this.xp >= state.xpForLevel(this.level)) {
            this.level++;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        let slots = 5 + Math.min(5, Math.floor(this.level / 10));
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

        if (this.level < (state.isBiomeGrid ? 1 : 2)) {
            this.levelProgress = this.xp / state.xpForLevel(this.level);
        } else {
            this.levelProgress = (this.xp - state.xpForLevel(this.level - 1)) / (state.xpForLevel(this.level) - state.xpForLevel(this.level - 1));
        }
    }

    get healthAdjustement() {
        if (state.isBiomeGrid) {
            // Make health scale exponentially so it can actually keep up with enemies
            return 80 * Math.pow(1.9, this.level / 10);
        } else {
            return 40 + 5 * Math.pow(this.level, 1.5);
        }
    }

    get bodyDamageAdjustment() {
        if (state.isBiomeGrid) {
            return 5;
        } else {
            return 5 + 1 * Math.pow(this.level, 1.5);
        }
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
                this.verified = true;
                console.log(`Client ${this.id} verified as ${this.username}`);

                tiers.forEach(tier => {
                    this.inventory[tier.name] = {};
                    petalConfigs.forEach(config => {
                        this.inventory[tier.name][config.id] = 0;
                    });
                });

                if (this.userId === state.secretKey && this.masterPermissions < 1) this.nameColor = "#F5D230";

                const dc = Client.disconnects.get(this.userId);

                if (dc) {
                    this.level = dc.level;
                    this.xp = dc.xp;
                    this.slots = dc.slots;
                    this.secondarySlots = dc.secondarySlots;
                    this.team = dc.team;
                    this.inventory = dc.inventory;
                    this.maxKilledRarity = dc.maxKilledRarity;
                    this.addXP(0);

                    if (dc.body) {
                        this.body = dc.body;
                        this.body.client = this;
                    }

                    clearTimeout(dc.timeout);
                    Client.disconnects.delete(this.userId);

                    console.log(`Client ${this.id} reconnected as ${this.username}`);
                }

                state.playerCount++;

                const sendReadyInterval = setInterval(() => {
                    // Do not tell client that we are ready until everything is initialized
                    if (!state.initialized) {
                        return;
                    }

                    clearInterval(sendReadyInterval);

                    this.talk(CLIENT_BOUND.READY);
                    this.sendRoom();
                    state.sendTerrain(this.id, this);

                    this.sendWelcomeMessage();
                }, 100);
                break;
            case SERVER_BOUND.SPAWN:
                this.spawnPlayer();
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

                if (this.body.moveStrength > 0.5 * this.body.speed) {
                    this.toggleAfk(false);
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

                const type = reader.getUint8();
                console.log("Activated dev cheat with type:", type);

                switch (type) {
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

                        if (index < 0 || index >= mobConfigs.length) {
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

                        if (state.isBiomeGrid && !mobConfigs[index]?.isBiomeGridOfficial) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Mob type is not officially implemented",
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

                        if (state.isBiomeGrid && !petalConfigs[index]?.isBiomeGridOfficial) {
                            return this.talk(CLIENT_BOUND.JSON_MESSAGE, {
                                promiseID: promiseID,
                                ok: false,
                                message: "Petal type is not officially implemented",
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

                if (message.startsWith("/login")
                    || message.startsWith("/register")
                    || message.startsWith("/save")
                    || message.startsWith("/import")
                ) {
                    // Exit early to avoid leaking login info
                    this.systemMessage("Error: This lobby does not have an account system.", colors.legendary);
                    return;
                }

                console.log(`(Chat) ${this.username}: ${message}`);

                if (state.isBiomeGrid) {
                    if (message === "/damage" && false) {
                        this.body.health.lastDamaged = Date.now();
                        this.body.health.health = 1;
                        this.systemMessage("Max health: " + this.body.health.maxHealth, colors.leafGreen);
                        return;
                    } else if (message === "/poison" && false) {
                        // Do not poison if already at critically low HP
                        if (this.body.health.health <= 1 || this.body.poison.timer > 0) {
                            return;
                        }
                        this.body.health.lastDamaged = Date.now();
                        this.body.poison.timer = 22.5 * 1;
                        this.body.poison.damage = (this.body.health.health - 1) / 23;
                        this.systemMessage("Max health: " + this.body.health.maxHealth, colors.leafGreen);
                        return;
                    } else if (message === "/afk") {
                        this.toggleAfk(!this.afk, true);
                        return;
                    } else if (message === "/xp" || message === "/exp") {
                        this.systemMessage("Your current XP: " + formatLargeNumber(this.xp, 2), colors.leafGreen);
                        if (this.level >= 10 * (tiers.length - 2)) {
                            this.systemMessage("You are at the max level.", colors.leafGreen);
                        } else {
                            this.systemMessage("XP required for next level: " + formatLargeNumber(state.xpForLevel(this.level), 2), colors.leafGreen);
                        }
                        return;
                    } else if (message === "/hp" || message === "/health") {
                        this.systemMessage("Your max health: " + formatLargeNumber(this.body.health.maxHealth, 2), colors.leafGreen);
                        return;
                    } else if (message === "/die" || message === "/kill") {
                        if (this.body && !this.body.health.isDead) {
                            this.body.destroy();
                            this.systemMessage("/die command activated.", colors.leafGreen);
                        } else {
                            this.systemMessage("Error: You are already dead.", colors.legendary);
                        }
                        return;
                    } else if (message === "/tp" || message === "/teleport") {
                        if (!this.body || this.body.health.isDead) {
                            this.systemMessage("Error: Cannot teleport while you are dead.", colors.legendary);
                        } else if (this.body.tpCooldown > 0) {
                            const seconds = Math.ceil(this.body.tpCooldown / 22.5);
                            if (seconds === 1) {
                                this.systemMessage("Error: Your teleport is on cooldown. Please try again in 1 second.", colors.legendary);
                            } else {
                                this.systemMessage(`Error: Your teleport is on cooldown. Please try again in ${seconds} seconds.`, colors.legendary);
                            }
                        } else if (Math.abs(this.body.y) < state.mapConstants.tpThreshold) {
                            this.systemMessage("Error: You can only teleport at the top/bottom of the map.", colors.legendary);
                        } else {
                            // Despawn the player's petals when teleporting
                            for (let slot of this.body.petalSlots) {
                                for (let petal of slot.petals) {
                                    petal?.destroy();
                                }
                            }

                            this.body.y = state.mapConstants.tpThreshold * Math.sign(this.body.y) * -1;
                            this.body.tpCooldown = 22.5 * 20;
                            if (this.body.y > 0) {
                                this.systemMessage("Successfully teleported to Desert.", colors.leafGreen);
                            } else {
                                this.systemMessage("Successfully teleported to Garden.", colors.leafGreen);
                            }
                        }
                        return;
                    } else if (message === "/help") {
                        this.systemMessage("Available commands:", colors.uncommon);
                        this.systemMessage("/help - Shows you the list of available commands.", colors.unique);
                        this.systemMessage("/info [1-6] - Info about this gamemode's unique mechanics.", colors.unique);
                        this.systemMessage("/tp - Teleports you from the top of the map to the bottom of the map, and vice versa.", colors.unique);
                        this.systemMessage("/afk - Lets other players know that you are AFK.", colors.unique);
                        this.systemMessage("/xp - Tells you your current XP (the leaderboard shows your level instead).", colors.unique);
                        this.systemMessage("/hp - Tells you your current max HP (including +HP petals).", colors.unique);
                        this.systemMessage("/die - Kills your flower and lets you respawn afterward.", colors.unique);
                        return;
                    } else if (message === "/info" || message === "/info 1") {
                        this.systemMessage("INFO 1/6 - SERVER INFO", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage(
                            "- This gamemode is unfinished and under active development. If you find any bugs or " +
                            "issues, please report them to the gamemode's creator (@pigeonbar on Discord)",
                            colors.unique,
                        );
                        this.systemMessage(
                            "- This lobby has an estimated completion time of 1-2 hours.",
                            colors.unique,
                        );
                        this.systemMessage(
                            "- This server (along with all player progress) gets reset daily at midnight UTC. " +
                            "New updates may also happen during server resets.",
                            colors.unique,
                        );
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("(Use \"/info 2\" to continue...)", colors.uncommon);
                        return;
                    } else if (message === "/info 2") {
                        this.systemMessage("INFO 2/6 - ADRENALINE MECHANIC", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage(
                            "- Whenever your flower takes non-poison damage, all your petals skip 6.25% of their " +
                            "reload time (capped at 50%).",
                            colors.lightningTeal,
                        );
                        this.systemMessage(
                            "- Also, if a petal reaches the 50% cap, it also generates an electric spark for 20% " +
                            "extra damage.",
                            colors.lightningTeal,
                        );
                        this.systemMessage(
                            "- Garden petals provide healing and other defensive benefits. This lets you utilize " +
                            "Adrenaline when killing Ocean mobs, which are aggressive and rapidly deal chip damage.",
                            colors.lightningTeal,
                        );
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("(Use \"/info 3\" to continue...)", colors.uncommon);
                        return;
                    } else if (message === "/info 3") {
                        const damageColor = "#FF4D4D";
                        this.systemMessage("INFO 3/6 - POISON DRAIN MECHANIC", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage(
                            "- If a player or mob gets hit with non-poison damage, the player/mob's " +
                            "poison attacks will be weaker afterwards (capped at -75%).",
                            damageColor,
                        );
                        this.systemMessage(
                            "- For poisonous mobs, this debuff is indicated by an icon below the mob's HP bar. " +
                            "(Due to a bug, you must turn off \"Cache Petal Assets\" to see this indicator, sorry!)",
                            damageColor,
                        );
                        this.systemMessage(
                            "- Players lose 20% poison damage per hit and regain 10% per second.",
                            damageColor,
                        );
                        this.systemMessage(
                            "- Mobs lose 2% poison damage per hit and regain 20% per second.",
                            damageColor,
                        );
                        this.systemMessage(
                            "- Ocean petals deal rapid chip damage, which lets you quickly neutralize the " +
                            "poisonous mobs found in the Desert.",
                            damageColor,
                        );
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("(Use \"/info 4\" to continue...)", colors.uncommon);
                        return;
                    } else if (message === "/info 4") {
                        const poisonColor = "#9B4DFF";
                        this.systemMessage("INFO 4/6 - TOXIC REMNANTS MECHANIC", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage(
                            "- When a player or mob takes poison damage, it also inflicts Toxic " +
                            "Remnants at a 3:1 ratio. If the player/mob tries to heal afterward, " +
                            "the healing and the Toxic Remnants cancel each other out.",
                            poisonColor,
                        );
                        this.systemMessage(
                            "- Your current Toxic Remnants is displayed as a white bar inside your HP bar " +
                            "(normally used to display shield in other gamemodes).",
                            poisonColor,
                        );
                        this.systemMessage(
                            "- Desert petals are poisonous and perfect for killing Garden mobs which try to " +
                            "heal themselves.",
                            poisonColor,
                        );
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("(Use \"/info 5\" to continue...)", colors.uncommon);
                        return;
                    } else if (message === "/info 5") {
                        this.systemMessage("INFO 5/6 - MOB MECHANICS", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage(
                            "- Whenever you die, you lose all damage progress on every mob that you haven't successfully " +
                            "killed. Use other petals wisely in order to stay alive.",
                            colors.unique,
                        );
                        this.systemMessage(
                            "- Desert mobs are so poisonous that you will get poisoned when your petals make contact " +
                            "with them! This poison damage increases as the mob's HP decreases, maxing out at 1x the " +
                            "mob's base poison at low HP. (This does not count as getting hit for any other purposes.)",
                            colors.unique,
                        );
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("(Use \"/info 6\" to continue...)", colors.uncommon);
                    } else if (message === "/info 6") {
                        this.systemMessage("INFO 6/6 - FINAL TIPS", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        this.systemMessage("Here are some final tips for this gamemode:", colors.unique);
                        this.systemMessage(
                            "- You can teleport between Garden and Desert by moving to the top/bottom of the map " +
                            "and then using \"/tp\".",
                            colors.unique,
                        );
                        this.systemMessage(
                            "- You start the game with a \"Gallery\" petal in your secondary row. You can hit a " +
                            "mob with this petal to view the mob's stats.",
                            colors.unique,
                        );
                        this.systemMessage(
                            "- You can use \"/hp\" to view your current max HP, which can be useful for tank builds.",
                            colors.unique,
                        );
                        this.systemMessage("Thank you for playing Biome Grid, and have fun!", colors.unique);
                        return;
                    } else if (message === "/info 7") {
                        this.systemMessage("INFO 7/6 - undefined", colors.uncommon);
                        this.systemMessage("", colors.uncommon);
                        let msg = "-You can hold the [J] key to vie Uncaught OutOfBoundsError ";
                        let chars = "          ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()1234567890";
                        for (let i = 0; i < 100; i++) {
                            msg += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        this.systemMessage(msg, colors.legendary);
                        return;
                    }

                    this.toggleAfk(false);
                }

                if (!/^[\w\s,.!?'"@#%^&*()_\-+=:;<>\/\\|[\]{}~`\u00A0-\uFFFF]{1,128}$/.test(message)) {
                    this.systemMessage("That message is too long or contains invalid characters.", "#CACA22");
                    this.frownyMessages++;

                    if (this.frownyMessages >= 5) {
                        this.kick("Abusing chat");
                    }
                    return;
                }

                if (message.length > 10) {
                    const setOfChars = new Set(message);
                    const split = message.split("");
                    for (const char of setOfChars) {
                        if (split.filter(c => c === char).length > message.length / 3) {
                            this.systemMessage("Please refrain from spamming.", "#22CACA");
                            this.frownyMessages++;

                            if (this.frownyMessages >= 5) {
                                this.kick("Abusing chat");
                            }
                            return;
                        }
                    }
                }

                if (tripsFilter(message)) {
                    this.systemMessage("Please refrain from saying slurs.", "#CA2222");
                    this.frownyMessages++;

                    if (this.frownyMessages >= 5) {
                        this.kick("Abusing chat");
                    }
                    return;
                }

                if (performance.now() - this.lastChat < 500) {
                    this.systemMessage("You're chatting too fast.", "#22CACA");
                    return;
                }

                this.lastChat = performance.now();
                state.clients.forEach(c => c.chatMessage(this.username, message, this.nameColor));
            } break;
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

    /**
     * Toggles the client's AFK status. By default, it also stops the player
     * from accidentally toggling their AFK status OFF for 10s after toggling
     * their AFK status ON.
     */
    toggleAfk(newAfk, bypassTimer = false) {
        if (newAfk === false && this.afk === true && (bypassTimer || Date.now() > this.afkTime + 10000)) {
            this.systemMessage("AFK status set to OFF.", colors.leafGreen);
            this.afk = false;
        } else if (newAfk === true && this.afk === false) {
            this.systemMessage("AFK status set to ON.", colors.leafGreen);
            this.afk = true;
            this.afkTime = Date.now();
        }
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

            if (state.isBiomeGrid) {
                // In grid mode, the leaderboard displays the player's level instead of their XP
                writer.setFloat32(entity.level / 10000);
            } else {
                writer.setFloat32(entity.xp / 10000);
            }

            let nameToSend = entity.username;
            if (state.isBiomeGrid && entity.afk) {
                nameToSend = "[AFK] " + entity.username;
            }
            writer.setStringUTF8(nameToSend);
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
    }

    sendRoom(biomeOverride) {
        if (biomeOverride !== undefined) {
            this.talk(CLIENT_BOUND.ROOM_UPDATE, { ...state, biome: biomeOverride });
        } else {
            this.talk(CLIENT_BOUND.ROOM_UPDATE, state);
        }
    }

    sendWelcomeMessage() {
        if (state.isBiomeGrid) {
            // Send welcome message for biome grid
            this.systemMessage(
                "Welcome to Biome Grid! In this gamemode, you will exploit type matchups to defeat enemies in a " +
                "grid of 3 biomes!",
                colors.uncommon,
            );
            this.systemMessage("", colors.uncommon);
            this.systemMessage(
                "This gamemode has several important mechanics not present in other gamemodes. For example, Garden " +
                "mobs can heal themselves, but you can prevent them from healing by poisoning them. To learn more, " +
                "please use \"/info [1-6]\" .",
                colors.uncommon,
            );
            this.systemMessage("", colors.uncommon);
        }
    }

    /** @param {Drop} drop */
    addDrop(drop) {
        this.camera.dropsToAdd.push(drop);
    }

    /** @param {Drop} drop */
    removeDrop(drop) {
        this.camera.dropsToRemove.push(drop);
    }

    /**
     * A helper function to respawn the player.
     */
    spawnPlayer() {
        if (!this.verified) {
            this.kick("Not verified");
            return;
        }

        if (this.body && !this.body.health.isDead) {
            return;
        }

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

        if (state.isBiomeGrid) {
            this.aliveTimer = 0;
            this.toggleAfk(false);
        }

        if (state.isTDM) {
            this.body.team = -this.team;
        }
        state.alivePlayers.push(this);
    }

    /**
     * A helper function to reset this client's progress back to the very
     * beginning. For example, this is done during server resets.
     *
     * This function also handles respawning the player at the beginning of the
     * map.
     */
    resetProgress() {
        this.body?.destroy(false);

        this.inventory = {};
        tiers.forEach(tier => {
            this.inventory[tier.name] = {};
            petalConfigs.forEach(config => {
                this.inventory[tier.name][config.id] = 0;
            });
        });
        this.slots = new Array(5).fill(null).map(() => ({ id: 0, rarity: 0 }));
        this.slotRatios = new Array(5).fill(0).map(() => 0);
        this.secondarySlots = new Array(5).fill(null).map(() => null);
        this.level = 1;
        this.xp = 1;
        if (state.isBiomeGrid) {
            this.secondarySlots[0] = { id: petalIDOf("Gallery"), rarity: 0 };
            this.xp = state.xpForLevel(0) + 0.00001;
        }
        this.maxKilledRarity = 0;
        this.sentBiome = undefined;

        this.spawnPlayer();
    }

    static resetLobby() {
        state.resetTime += 24 * 3600 * 1000;

        state.drops.forEach(drop => drop.destroy());

        state.drops = new Map();
        state.pentagrams = new Map();
        state.lightning = new Map();
        Client.disconnects = new Map();

        state.entities.forEach(entity => {
            // Respawning players and resetting player progress is handled separately
            if (entity.type !== ENTITY_TYPES.PLAYER) {
                entity.damagedBy = {};
                entity.destroy();
            }
        });

        state.clients.forEach(client => {
            client.resetProgress();
            client.systemMessage("Server: All progress has been reset!", colors.uncommon);
        });
    }
}
