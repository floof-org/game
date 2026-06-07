import state from "./state.js";
import { Entity, Mob, Player } from "./Entity.js";
import { Reader, Writer, CLIENT_BOUND, ENTITY_FLAGS, ENTITY_MODIFIER_FLAGS, ROUTER_PACKET_TYPES, SERVER_BOUND, ENTITY_TYPES, DEV_CHEAT_IDS, WEARABLES } from "../../lib/protocol.js";
import { mobConfigs, mobIDOf, petalConfigs, tiers } from "./config.js";
import { xpForLevel } from "../../lib/util.js";

const blockList = [];
fetch("/profanity.txt").then(res => res.text()).then(txt => {
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
        this.slots = client.slots;
        this.secondarySlots = client.secondarySlots;
        this.body = client.body;
        this.team = client.team;
        this.inventory = client.inventory;

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

        this.lastChat = 0;
        this.frownyMessages = 0;
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

        let slots = 5 + Math.min(5, Math.floor(this.level / 10));
        if (slots !== this.slots.length) {
            if (slots > this.slots.length) {
                for (let i = this.slots.length; i < slots; i++) {
                    this.slots.push({ id: 0, rarity: 0 });
                    this.secondarySlots.push(null);
                }
            } else if (slots < this.slots.length)
                for (let i = this.slots.length - 1; i >= slots; i--)
                    for (const { id, rarity } of [this.slots.pop(), this.secondarySlots.pop()].filter(({id, rarity}) => id !== null))
                        if (this.inventory[tiers[rarity].name][id]) this.inventory[tiers[rarity].name][id]++;
                        else this.inventory[tiers[rarity].name][id] = 1;

            if (this.body && !this.body.health.isDead) this.body.initSlots(slots);
        }

        this.levelProgress = this.level < 2 ? this.xp / xpForLevel(this.level) : (this.xp - xpForLevel(this.level - 1)) / (xpForLevel(this.level) - xpForLevel(this.level - 1));
    }

    get healthAdjustement() {
        return 40 + 5 * Math.pow(this.level, 1.5);
    }

    get bodyDamageAdjustment() {
        return 5 + 1 * Math.pow(this.level, 1.5);
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
                break;
            case SERVER_BOUND.SPAWN:
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
                this.addXP(0)

                this.body.initSlots(this.slots.length);
                for (let i = 0; i < this.slots.length; i++) {
                    if (this.slots[i]) {
                        this.body.setSlot(i, this.slots[i].id, this.slots[i].rarity);
                    }
                }

                this.body.spawnInvincibility = true

                setTimeout(() => {
                    if (this.body) {
                        this.body.spawnInvincibility = false;
                    }
                }, 2 * 1000);

                if (state.isTDM) {
                    this.body.team = -this.team;
                }
                state.alivePlayers.push(this);
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
