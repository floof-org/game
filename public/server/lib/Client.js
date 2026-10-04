import state from "./state.js";
import { Entity, Mob, Player } from "./Entity.js";
import { Reader, Writer, CLIENT_BOUND, ENTITY_FLAGS, ENTITY_MODIFIER_FLAGS, GAMEMODES, ROUTER_PACKET_TYPES, SERVER_BOUND, ENTITY_TYPES, DEV_CHEAT_IDS, WEARABLES, RARITY_TABLE } from "../../lib/protocol.js";
import { mobConfigs, mobIDOf, petalConfigs, tiers, DROP_LOOKUP, allPossiblePetals } from "./config.js";
import { colors, xpForLevel } from "../../lib/util.js";
import accounts from "./Accounts.js";
import craftManager from "./CraftManager.js";

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

const RARITY_ORDER = tiers.map(tier => tier.name);

const VALID_COMMANDS = new Set([
    "/help", "/cmd", "/commands", "/infocommands", "/admincommands",
    "/mobinfo", "/petalinfo", "/rarities", "/drops",
    "/godmode", "/die", "/killmob", "/killall", "/resetmobs", "/mobcount", "/spawnmob",
    "/give", "/addall", "/remove", "/online",
    "/mute", "/kick", "/ban", "/unban", "/unmute"
]);

function normalizeName(str) {
    return str.toLowerCase().replace(/\s+/g, "");
}

const MIN_SLOTS = 5;
const MAX_SLOTS = 10;

function sanitizeSlotLength(length) {
    const value = Math.floor(+length);
    if (!Number.isFinite(value)) return MIN_SLOTS;
    return Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, value));
}

function sanitizeSlots(slots, length, nullable = false) {
    const count = sanitizeSlotLength(length);
    const output = new Array(count);
    const maxId = petalConfigs.length - 1;
    const maxRarity = tiers.length - 1;

    for (let i = 0; i < count; i++) {
        const slot = slots?.[i];

        if (!slot || slot.id === 0) {
            output[i] = nullable ? null : { id: 0, rarity: 0 };
            continue;
        }

        const id = Math.min(maxId, Math.max(0, Math.floor(+slot.id || 0)));
        const rarity = Math.min(maxRarity, Math.max(0, Math.floor(+slot.rarity || 0)));
        output[i] = { id, rarity };
    }

    return output;
}

function formatDuration(ms) {
    if (!Number.isFinite(ms)) return "permanently";

    let seconds = Math.ceil(ms / 1000);
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const hours = Math.floor(seconds / 3600); seconds %= 3600;
    const minutes = Math.floor(seconds / 60); seconds %= 60;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || !parts.length) parts.push(`${seconds}s`);

    return parts.join(" ");
}

function findTargetClient(playerName) {
    const lower = playerName.toLowerCase();

    for (const client of state.clients.values()) {
        if (!client.verified || client === undefined) continue;

        if (client.username.toLowerCase() === lower) return client;
        if (client.discordName?.toLowerCase() === lower) return client;
    }

    return null;
}

/**
 * Punishment target: prefer the online player's Discord ID (authoritative), fall back to the Discord username in the punishment record when offline
 * @param {string} playerName
 */
function resolveModerationTarget(playerName) {
    const client = findTargetClient(playerName);

    if (client) {
        return { discordId: String(client.userId ?? ""), playerName: client.discordName || client.username, client };
    }

    const discordId = accounts.findModerated(playerName);

    return discordId ? { discordId, playerName, client: null } : null;
}

function formatNumber(num) {
    const abs = Math.abs(num);
    const suffixes = [
        ["Nv", 1e30], ["Oc", 1e27], ["Sp", 1e24], ["Sx", 1e21],
        ["Qt", 1e18], ["Qd", 1e15], ["t", 1e12], ["b", 1e9], ["m", 1e6], ["k", 1e3]
    ];

    for (const [suffix, value] of suffixes) {
        if (abs >= value) {
            const formatted = (num / value).toFixed(2).replace(/\.?0+$/, "");
            return formatted + suffix;
        }
    }

    return Math.round(num).toString();
}

function formatAmount(n) {
    if (n === 1) return "";

    const format = (value, suffix) => {
        const rounded = Math.round(value * 10) / 10;
        return ` x${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}${suffix}`;
    };

    if (n >= 1e30) return format(n / 1e30, "Nv");
    if (n >= 1e27) return format(n / 1e27, "Oc");
    if (n >= 1e24) return format(n / 1e24, "Sp");
    if (n >= 1e21) return format(n / 1e21, "Sx");
    if (n >= 1e18) return format(n / 1e18, "Qt");
    if (n >= 1e15) return format(n / 1e15, "Qd");
    if (n >= 1e12) return format(n / 1e12, "t");
    if (n >= 1e9) return format(n / 1e9, "b");
    if (n >= 1e6) return format(n / 1e6, "m");
    if (n >= 1e3) return format(n / 1e3, "k");

    return ` x${n}`;
}

function formatPercent(p) {
    return parseFloat(p.toFixed(10)).toString();
}

function findMobByName(name) {
    const needle = normalizeName(name);

    return mobConfigs.find(m => m?.name && normalizeName(m.name) === needle) ?? null;
}

function getItemName(index) {
    return petalConfigs[index]?.name ?? `Item${index}`;
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
    dropAmounts = new Map();

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

            this.dropAmounts.set(drop.id, drop.amount ?? 1);
        });

        writer.setUint32(0);

        this.dropsToRemove.forEach(drop => {
            writer.setUint32(drop.id);
        });

        writer.setUint32(0);

        this.dropsToRemove.forEach(drop => {
            this.dropAmounts.delete(drop.id);
        });

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

export default class Client {
    /** @type {Map<number, Client>} */
    static clients = new Map();

    constructor(id, userId, masterPermissions = 0) {
        this.id = id;
        this.verified = false;
        this.username = "unknown";
        this.discordName = "";
        this.userId = userId;
        this.nameColor = ["#FFFFFF", "#D85555", "#F5D230"][+masterPermissions] || "#FFFFFF";
        this.masterPermissions = +masterPermissions;
        this.inventory = {};
        this.craftAttempts = {};
        this.handlingCraft = false;
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
        this.firstSpawn = true;
        this.slotRatios = new Array(5).fill(0).map(() => 0);
        this.secondarySlots = new Array(5).fill(null).map(() => null);
        this.level = 1;
        this.xp = 1;

        this.lastChat = 0;
        this.frownyMessages = 0;
    }

    /** @param {object} data save contents */
    restoreFromData(data) {
        this.level = Math.min(9999, Math.max(1, Math.floor(+data.level || 1)));
        this.xp = Math.min(1e21, Math.max(1, +data.xp || 1));

        const slotLength = sanitizeSlotLength(data.slots?.length || this.slots.length);
        this.slots = sanitizeSlots(data.slots, slotLength);
        this.secondarySlots = sanitizeSlots(data.secondarySlots, slotLength, true);

        const inv = data.inventory || {};
        tiers.forEach(tier => this.inventory[tier.name] = {});
        for (const rarity in inv) {
            if (!(rarity in this.inventory)) continue;
            for (const id in inv[rarity]) {
                const amount = Math.floor(+inv[rarity][id] || 0);
                if (amount > 0) this.inventory[rarity][id] = amount;
            }
        }

        const attempts = data.craftAttempts || {};
        tiers.forEach(tier => this.craftAttempts[tier.name] = {});
        for (const rarity in attempts) {
            if (!(rarity in this.craftAttempts)) continue;
            for (const id in attempts[rarity]) {
                const count = Math.floor(+attempts[rarity][id] || 0);
                if (count > 0) this.craftAttempts[rarity][id] = count;
            }
        }

        this.addXP(0);

        if (this.body && !this.body.health.isDead) {
            this.body.initSlots(this.slots.length);

            for (let i = 0; i < this.slots.length; i++) {
                if (this.slots[i]) {
                    this.body.setSlot(i, this.slots[i].id, this.slots[i].rarity);
                }
            }
        }
    }

    /** name shown in the kill message */
    lootName() {
        return this.username;
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
                    for (const { id, rarity } of [this.slots.pop(), this.secondarySlots.pop()].filter(slot => slot !== null))
                        if (this.inventory[tiers[rarity].name][id]) this.inventory[tiers[rarity].name][id]++;
                        else this.inventory[tiers[rarity].name][id] = 1;

            if (this.body && !this.body.health.isDead) this.body.initSlots(slots);
        }

        this.levelProgress = this.level < 2 ? this.xp / xpForLevel(this.level) : (this.xp - xpForLevel(this.level - 1)) / (xpForLevel(this.level) - xpForLevel(this.level - 1));
    }

    grantOwnerPermissions() {
        const owners = ((typeof Bun !== "undefined" && Bun.env.OWNER_DISCORD_IDS) || "").split(",").map(id => id.trim()).filter(Boolean);

        if (owners.includes(String(this.userId ?? ""))) {
            this.masterPermissions = Math.max(this.masterPermissions, 2);
            this.nameColor = "#F5D230";
            if (this.body) this.body.nameColor = "#F5D230";
            console.log(`Client ${this.id} (${this.username}) granted owner permissions.`);
        }
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
        this.inventory[rarity][drop.index] += drop.amount ?? 1;
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
                this.discordName = this.username;
                this.verified = true;
                console.log(`Client ${this.id} verified as ${this.username}`);

                const banLeft = accounts.banRemaining(this.userId);

                if (banLeft > 0) {
                    this.kick(`You are banned${banLeft === Infinity ? " permanently" : ` for ${formatDuration(banLeft)}`}.`);
                    return;
                }

                this.talk(CLIENT_BOUND.READY);
                this.sendRoom();
                state.sendTerrain(this.id);
                tiers.forEach(tier => {
                    this.inventory[tier.name] = {};
                    this.craftAttempts[tier.name] = {};
                });

                // restores the save behind this Discord id, must run after the inventory tiers are initialized
                accounts.attach(this);
                this.grantOwnerPermissions();

                const onlineCount = state.clients.size;

                state.clients.forEach(client => {
                    if (client !== this) client.systemMessage(`${this.username} has joined the game! (${onlineCount} players online)`, "#00f2ff");
                });

                this.systemMessage("Your progress is saved automatically.", "#00f2ff");

                if (this.userId === state.secretKey && this.masterPermissions < 1) this.nameColor = "#F5D230";

                state.playerCount++;
                
                if (state.useCraftingProtocol) {
                    this.talk(CLIENT_BOUND.CRAFT_INIT);
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
                this.firstSpawn = false;
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
                        this.body.setGodmode(!this.body._godmode);
                        console.log(`[gm] ${this.username} godmode ${this.body._godmode ? "on" : "off"} via dev-cheat`);
                    } break;
                    case DEV_CHEAT_IDS.CHANGE_TEAM: {
                        console.log(`[change-team] ${this.username} blocked CHANGE_TEAM`);
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
                const mutedLeft = accounts.muteRemaining(this.userId);

                if (mutedLeft > 0) {
                    this.systemMessage(`You're muted. ${mutedLeft === Infinity ? "This mute is permanent." : `Muted for ${formatDuration(mutedLeft)} more.`}`, "#ff5555");
                    return;
                }

                if (!/^[\w\s,.!?'"@#%^&*()_\-+=:;<>\/\\|[\]{}~`\u00A0-\uFFFF]{1,128}$/.test(message)) {
                    this.systemMessage("That message is too long or contains invalid characters.", "#CACA22");
                    this.frownyMessages++;

                    if (this.frownyMessages >= 5) {
                        this.kick("Abusing chat");
                    }
                    return;
                }

                if (message.startsWith("/")) {
                    const parts = message.trim().split(/\s+/);
                    const cmd = parts[0].toLowerCase();

                    if (!VALID_COMMANDS.has(cmd)) {
                        this.systemMessage("Unknown command. Please read /help", "#ff5555");
                        return;
                    }

                    this.lastChat = performance.now();
                    this.handleCommand(message);
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
            case SERVER_BOUND.CRAFT_REQUEST:
                if (!state.useCraftingProtocol) {
                    return this.systemMessage("Error: This lobby has crafting disabled!", colors.legendary);
                }

                // Craft request data should be in the following order: Rarity, Petal ID, Amount.
                craftManager.handleCraftRequest(this, reader.getUint8(), reader.getUint8(), reader.getUint32());
                break;
        }
    }

    handleCommand(e) {
        const commandCheck = cmd => e.toLowerCase().startsWith(cmd);
        const requireAdmin = () => {
            if (this.masterPermissions < 1) {
                this.systemMessage("You are not allowed to run this command.", "#ff5555");
                return false;
            }

            return true;
        };

        const requireOwner = () => {
            if (this.masterPermissions < 2) {
                this.systemMessage("You are not allowed to run this command.", "#ff5555");
                return false;
            }

            return true;
        };

        // help
        if (commandCheck("/help") || commandCheck("/cmd") || commandCheck("/commands")) {
            [
                "Note: [text] indicates required, <text> indicates optional.",
                "/mobinfo [rarity] [mob name] - Shows health, damage and armor of the specified mob and rarity.",
                "/petalinfo [rarity] [petal name] - Preview the stats of the specified petal and rarity.",
                "/drops [rarity name] [mob name] - Shows the drop chances for the specified rarity and mob.",
                "/rarities - Shows all rarities.",
                "/online - Shows all currently online players.",
                "/die - Kills you.",
                "/infocommands - Shows all related commands that give info of something.",
                "/admincommands - Shows all admin commands."
            ].forEach(cmd => this.systemMessage(cmd, "#ffe65d"));
            return;
        }

        // /online
        if (commandCheck("/online")) {
            const online = [...state.clients.values()].filter(client => client.verified);

            this.systemMessage(`Online players (${online.length}):`, "#00f2ff");
            for (const client of online) {
                this.systemMessage(`- ${client.username}`, "#55ff55");
            }
            return;
        }

        // info help
        if (commandCheck("/infocommands")) {
            [
                "Note: [text] indicates required, <text> indicates optional.",
                "/mobinfo [rarity] [mob name] - Shows health, damage and armor of the specified mob and rarity.",
                "/petalinfo [rarity] [petal name] - Preview the stats of the specified petal and rarity.",
                "/drops [rarity name] [mob name] - Shows the drop chances for the specified rarity and mob.",
                "/rarities - Shows all rarities."
            ].forEach(cmd => this.systemMessage(cmd, "#ffe65d"));
            return;
        }

        // admin help
        if (commandCheck("/admincommands")) {
            [
                "Note: [text] indicates required, <text> indicates optional.",
                "/spawnmob [rarity] [mob] [x] [y] <amount> - Spawns the specified mob at the coordinates.",
                "/killmob [mobID] - Kills the mob with the specified ID.",
                "/killall [rarity] <mobname> - Kills all mobs of the specified rarity and mob.",
                "/resetmobs - Resets all mobs.",
                "/mobcount - Shows the living and actual mob count.",
                "/godmode - Toggles godmode.",
                "/give [player] [petal] [rarity] <amount> - Gives a player a petal. Petal names may omit spaces (e.g. firemissile). Amount defaults to 1.",
                "/remove [rarity] <petal> <amount> - Removes petals of the given rarity from your own inventory. Omit the petal to remove every petal of that rarity. Amount defaults to 1.",
                "/addall [rarity] - Adds all obtainable petals of that rarity to your inventory.",
                "/kick [player] - Kicks a player from the game.",
                "/mute [player] [seconds] - Mutes a player. 0 is permanent, max 30 days.",
                "/unmute [player] - Removes a player's mute.",
                "/ban [player] [seconds] - Bans a player. 0 is permanent, max 10 years.",
                "",
                "Bans and mutes are tied to the player's Discord ID, so renaming",
                "the Discord username does not remove them.",
                "Player is given by their Discord username."
            ].forEach(cmd => this.systemMessage(cmd, "#b570ff"));
            return;
        }

        // /kick
        if (commandCheck("/kick")) {
            if (!requireAdmin()) return;

            const args = e.slice(5).trim().split(/\s+/).filter(Boolean);

            if (args.length < 1) {
                this.systemMessage("Usage: /kick [player]", "#ffaa00");
                return;
            }

            const [playerName] = args;
            const target = findTargetClient(playerName);

            if (!target) {
                this.systemMessage(`Player "${playerName}" is not online.`, "#ff5555");
                return;
            }

            if (target.masterPermissions >= this.masterPermissions) {
                this.systemMessage(`You cannot kick ${target.username}.`, "#ff5555");
                return;
            }

            const name = target.username;
            target.kick(`Kicked by ${this.username}`);
            this.systemMessage(`Kicked ${name}.`, "#55ff55");
            return;
        }

        // /mute
        if (commandCheck("/mute")) {
            (async () => {
                if (!requireAdmin()) return;

                const args = e.slice(5).trim().split(/\s+/).filter(Boolean);

                if (args.length < 2) {
                    this.systemMessage("Usage: /mute [player] [seconds]", "#ffaa00");
                    return;
                }

                const [playerName, durationArg] = args;
                const target = resolveModerationTarget(playerName);

                if (!target) {
                    this.systemMessage(`Player "${playerName}" is not online and has no ban/mute on record.`, "#ff5555");
                    return;
                }

                if (target.client && target.client.masterPermissions >= this.masterPermissions) {
                    this.systemMessage(`You cannot mute ${target.client.username}.`, "#ff5555");
                    return;
                }

                const result = await accounts.mute(target.discordId, durationArg, target.playerName);

                if (!result.ok) {
                    this.systemMessage(result.error, "#ff5555");
                    return;
                }

                const when = result.duration === Infinity ? "permanently" : `for ${formatDuration(result.duration * 1000)}`;
                target.client?.systemMessage(`You have been muted ${when}.`, "#ff5555");
                this.systemMessage(`Muted ${target.playerName} ${when}.`, "#55ff55");
            })();

            return;
        }

        // /unmute
        if (commandCheck("/unmute")) {
            (async () => {
                if (!requireAdmin()) return;

                const args = e.slice(7).trim().split(/\s+/).filter(Boolean);

                if (args.length < 1) {
                    this.systemMessage("Usage: /unmute [player]", "#ffaa00");
                    return;
                }

                const [playerName] = args;
                const target = resolveModerationTarget(playerName);

                if (!target) {
                    this.systemMessage(`Player "${playerName}" not found.`, "#ff5555");
                    return;
                }

                const result = await accounts.unmute(target.discordId);

                if (!result.ok) {
                    this.systemMessage(result.error, "#ff5555");
                    return;
                }

                target.client?.systemMessage("You have been unmuted.", "#55ff55");
                this.systemMessage(`Unmuted ${target.playerName}.`, "#55ff55");
            })();

            return;
        }

        // /ban
        if (commandCheck("/ban")) {
            (async () => {
                if (!requireAdmin()) return;

                const args = e.slice(4).trim().split(/\s+/).filter(Boolean);

                if (args.length < 2) {
                    this.systemMessage("Usage: /ban [player] [seconds]", "#ffaa00");
                    return;
                }

                const [playerName, durationArg] = args;
                const target = findTargetClient(playerName);

                if (target?.masterPermissions >= this.masterPermissions && target !== this) {
                    this.systemMessage(`You cannot ban ${target.username}.`, "#ff5555");
                    return;
                }

                // banned players can act offline: look for an existing punishment record first, otherwise only target online players
                const resolved = resolveModerationTarget(playerName);

                if (!resolved) {
                    this.systemMessage(`Player "${playerName}" is not online and has no ban on record.`, "#ff5555");
                    return;
                }

                const result = await accounts.ban(resolved.discordId, durationArg, resolved.playerName);

                if (!result.ok) {
                    this.systemMessage(result.error, "#ff5555");
                    return;
                }

                const reason = result.duration === Infinity ? "permanently" : `for ${formatDuration(result.duration * 1000)}`;

                if (target) target.kick(`Banned ${reason} by ${this.username}`);

                this.systemMessage(`Banned ${resolved.playerName} ${reason}.`, "#55ff55");
            })();

            return;
        }

        // /unban
        if (commandCheck("/unban")) {
            (async () => {
                if (!requireOwner()) return;

                const args = e.slice(6).trim().split(/\s+/).filter(Boolean);

                if (args.length < 1) {
                    this.systemMessage("Usage: /unban [player]", "#ffaa00");
                    return;
                }

                const [playerName] = args;
                const target = resolveModerationTarget(playerName);

                if (!target) {
                    this.systemMessage(`Player "${playerName}" has no ban on record.`, "#ff5555");
                    return;
                }

                const result = await accounts.unban(target.discordId);

                if (!result.ok) {
                    this.systemMessage(result.error, "#ff5555");
                    return;
                }

                this.systemMessage(`Unbanned ${target.playerName}.`, "#55ff55");
            })();

            return;
        }

        // /give
        if (commandCheck("/give")) {
            (async () => {
                if (!requireOwner()) return;

                const args = e.slice(5).trim().split(/\s+/).filter(Boolean);

                if (args.length < 3) {
                    this.systemMessage("Usage: /give [player] [petal] [rarity] <amount>", "#ffaa00");
                    return;
                }

                const [playerName, petalArg, rarityArg, amountArg] = args;

                // petal names may omit spaces: both "fire missile" and "firemissile" resolve
                const normalize = s => s.toLowerCase().replace(/\s+/g, "");
                const normalizedPetal = normalize(petalArg);

                let petalIndex = petalConfigs.findIndex(petal => petal?.name?.toLowerCase() === petalArg.toLowerCase());

                if (petalIndex < 0) {
                    petalIndex = petalConfigs.findIndex(petal => petal?.name && normalize(petal.name) === normalizedPetal);
                }

                if (petalIndex < 0) {
                    this.systemMessage(`Petal "${petalArg}" not found.`, "#ff5555");
                    return;
                }

                let amount = 1;

                if (amountArg !== undefined) {
                    amount = parseInt(amountArg);

                    if (isNaN(amount) || amount < 1) {
                        this.systemMessage(`Invalid amount: ${amountArg}`, "#ff5555");
                        return;
                    }
                }

                let rarityIndex = null;

                if (!isNaN(rarityArg)) {
                    rarityIndex = parseInt(rarityArg);
                } else {
                    const lower = rarityArg.toLowerCase();

                    for (let i = 0; i < tiers.length; i++) {
                        if (tiers[i].name.toLowerCase() === lower) {
                            rarityIndex = i;
                            break;
                        }
                    }
                }

                if (rarityIndex === null || rarityIndex < 0 || rarityIndex >= tiers.length) {
                    this.systemMessage(`Invalid rarity: ${rarityArg}`, "#ff5555");
                    return;
                }

                const rarity = tiers[rarityIndex];
                let target = null;

                for (const client of state.clients.values()) {
                    if (!client.verified || client === undefined) continue;

                    if (client.username.toLowerCase() === playerName.toLowerCase()) {
                        target = client;
                        break;
                    }
                }

                if (target) {
                    if (!target.inventory[rarity.name]) target.inventory[rarity.name] = {};
                    target.inventory[rarity.name][petalIndex] = (target.inventory[rarity.name][petalIndex] || 0) + amount;
                    accounts.saveClient(target);

                    const label = amount === 1 ? "" : ` x${amount}`;

                    target.systemMessage(`You received ${amount} ${rarity.name} ${petalConfigs[petalIndex].name}${label}!`, "#55ff55");
                    this.systemMessage(`Gave ${amount} ${rarity.name} ${petalConfigs[petalIndex].name}${label} to ${target.username}.`, "#55ff55");
                    return;
                }

                const match = accounts.findByName(playerName);

                if (!match) {
                    this.systemMessage(`Player "${playerName}" not found.`, "#ff5555");
                    return;
                }

                match.save.data ??= {};
                match.save.data.inventory ??= {};
                match.save.data.inventory[rarity.name] ??= {};
                match.save.data.inventory[rarity.name][petalIndex] = (match.save.data.inventory[rarity.name][petalIndex] || 0) + amount;
                accounts.persist().catch(err => console.warn("[Accounts] Save failed:", err));

                const offlineLabel = amount === 1 ? "" : ` x${amount}`;

                this.systemMessage(`Gave ${amount} ${rarity.name} ${petalConfigs[petalIndex].name}${offlineLabel} to ${match.save.username} offline.`, "#55ff55");
            })();

            return;
        }

        // /remove
        if (commandCheck("/remove")) {
            (async () => {
                if (!requireOwner()) return;

                const args = e.slice(7).trim().split(/\s+/).filter(Boolean);

                if (args.length < 1) {
                    this.systemMessage("Usage: /remove [rarity] <petal> <amount>", "#ffaa00");
                    return;
                }

                const [rarityArg, ...rest] = args;

                let rarityIndex = null;

                if (!isNaN(rarityArg)) {
                    rarityIndex = parseInt(rarityArg);
                } else {
                    const lower = rarityArg.toLowerCase();

                    for (let i = 0; i < tiers.length; i++) {
                        if (tiers[i].name.toLowerCase() === lower) {
                            rarityIndex = i;
                            break;
                        }
                    }
                }

                if (rarityIndex === null || rarityIndex < 0 || rarityIndex >= tiers.length) {
                    this.systemMessage(`Invalid rarity: ${rarityArg}`, "#ff5555");
                    return;
                }

                const rarity = tiers[rarityIndex];

                // no petal given: wipe the whole rarity
                if (rest.length === 0) {
                    const petals = this.inventory[rarity.name] || {};
                    const removed = Object.values(petals).reduce((sum, count) => sum + count, 0);

                    if (removed <= 0) {
                        this.systemMessage(`You do not have any ${rarity.name} petals.`, "#ff5555");
                        return;
                    }

                    // Zero the counts instead of dropping the keys: the client merges the world
                    // update inventory per petal id and never forgets ids the server stops
                    // sending, so a removed entry would keep showing up in the inventory view.
                    for (const id of Object.keys(this.inventory[rarity.name])) {
                        this.inventory[rarity.name][id] = 0;
                    }

                    accounts.saveClient(this);

                    this.systemMessage(`Removed all ${removed} ${rarity.name} petals!`, "#55ff55");
                    return;
                }

                const petalArg = rest[0];
                const amountArg = rest[1];

                // petal names may omit spaces: both "fire missile" and "firemissile" resolve
                const normalize = s => s.toLowerCase().replace(/\s+/g, "");
                const normalizedPetal = normalize(petalArg);

                let petalIndex = petalConfigs.findIndex(petal => petal?.name?.toLowerCase() === petalArg.toLowerCase());

                if (petalIndex < 0) {
                    petalIndex = petalConfigs.findIndex(petal => petal?.name && normalize(petal.name) === normalizedPetal);
                }

                if (petalIndex < 0) {
                    this.systemMessage(`Petal "${petalArg}" not found.`, "#ff5555");
                    return;
                }

                let amount = 1;

                if (amountArg !== undefined) {
                    amount = parseInt(amountArg);

                    if (isNaN(amount) || amount < 1) {
                        this.systemMessage(`Invalid amount: ${amountArg}`, "#ff5555");
                        return;
                    }
                }

                const owned = this.inventory[rarity.name]?.[petalIndex] || 0;

                if (owned <= 0) {
                    this.systemMessage(`You do not have any ${rarity.name} ${petalConfigs[petalIndex].name}.`, "#ff5555");
                    return;
                }

                const removed = Math.min(amount, owned);
                this.inventory[rarity.name][petalIndex] -= removed;

                if (this.inventory[rarity.name][petalIndex] <= 0) {
                    // Keep a zero count rather than deleting the key, see the whole-rarity branch above.
                    this.inventory[rarity.name][petalIndex] = 0;
                }

                accounts.saveClient(this);

                this.systemMessage(`Removed ${removed} ${rarity.name} ${petalConfigs[petalIndex].name}!`, "#55ff55");
            })();

            return;
        }

        // /addall
        if (commandCheck("/addall")) {
            (async () => {
                if (!requireOwner()) return;

                const args = e.slice(7).trim().split(/\s+/).filter(Boolean);

                if (args.length < 1) {
                    this.systemMessage("Usage: /addall [rarity]", "#ffaa00");
                    return;
                }

                const rarityArg = args[0];
                let rarityIndex = null;

                if (!isNaN(rarityArg)) {
                    rarityIndex = parseInt(rarityArg);
                } else {
                    const lower = rarityArg.toLowerCase();

                    for (let i = 0; i < tiers.length; i++) {
                        if (tiers[i].name.toLowerCase() === lower) {
                            rarityIndex = i;
                            break;
                        }
                    }
                }

                if (rarityIndex === null || rarityIndex < 0 || rarityIndex >= tiers.length) {
                    this.systemMessage(`Invalid rarity: ${rarityArg}`, "#ff5555");
                    return;
                }

                const rarity = tiers[rarityIndex];
                const available = allPossiblePetals(rarityIndex);

                if (available.length === 0) {
                    this.systemMessage(`No petals are obtainable at ${rarity.name}.`, "#ffaa00");
                    return;
                }

                if (!this.inventory[rarity.name]) this.inventory[rarity.name] = {};

                for (const petalIndex of available) {
                    this.inventory[rarity.name][petalIndex] = (this.inventory[rarity.name][petalIndex] || 0) + 1;
                }

                accounts.saveClient(this);

                this.systemMessage(`Added all ${available.length} obtainable ${rarity.name} petals to your inventory!`, "#55ff55");
            })();

            return;
        }

        // /rarities
        if (commandCheck("/rarities")) {
            for (let i = 0; i < tiers.length; i++) {
                this.systemMessage(`${i} - ${tiers[i].name}`, tiers[i].color || "#FFFFFF");
            }

            this.systemMessage("Use in commands like:", "#ffe65d");
            this.systemMessage("/drops common beetle", "#3bedb5");
            this.systemMessage("/drops 0 beetle", "#3bedb5");
            return;
        }

        // /mobinfo
        if (commandCheck("/mobinfo")) {
            const args = e.substring(8).trim().split(/\s+/).filter(Boolean);

            if (args.length < 2 || !e.substring(8).trim()) {
                this.systemMessage("Usage: /mobinfo [rarity] [mob]", "#ffe65d");
                return;
            }

            let rarityIndex = -1;
            let rarityTokenCount = 0;

            for (let i = args.length; i > 0; i--) {
                const normCandidate = normalizeName(args.slice(0, i).join(" "));
                const index = RARITY_ORDER.findIndex(r => normalizeName(r) === normCandidate);

                if (index !== -1) {
                    rarityIndex = index;
                    rarityTokenCount = i;
                    break;
                }
            }

            if (rarityIndex === -1 && !isNaN(args[0])) {
                const num = parseInt(args[0]);

                if (RARITY_ORDER[num]) {
                    rarityIndex = num;
                    rarityTokenCount = 1;
                }
            }

            if (rarityIndex === -1) {
                this.systemMessage("Invalid rarity.", "#ff5e5e");
                return;
            }

            const mobName = args.slice(rarityTokenCount).join(" ");
            const mob = findMobByName(mobName);

            if (!mob) {
                this.systemMessage("Mob not found.", "#ff5e5e");
                return;
            }

            const rarityData = RARITY_TABLE[rarityIndex];

            if (!rarityData) {
                this.systemMessage("Invalid rarity.", "#ff5e5e");
                return;
            }

            const finalHealth = mob.health * rarityData.health;
            const finalDamage = mob.damage * rarityData.damage;
            const armor = rarityData.armor ?? 0;

            this.systemMessage(
                `${RARITY_ORDER[rarityIndex]} ${mob.name}: Health: ${formatNumber(finalHealth)}, Damage: ${formatNumber(finalDamage)}, Armor: ${formatNumber(armor)}`,
                tiers[rarityIndex]?.color || "#ffffff"
            );
            return;
        }

        // /petalinfo (alias: /petal)
        if (commandCheck("/petalinfo") || e.toLowerCase().startsWith("/petal ") || e.toLowerCase() === "/petal") {
            const cmdLen = e.toLowerCase().startsWith("/petalinfo") ? 10 : 6;
            const args = e.substring(cmdLen).trim().split(/\s+/).filter(Boolean);

            if (args.length < 1) {
                this.systemMessage("Usage: /petalinfo [rarity] [petal]", "#ffe65d");
                return;
            }

            let rarityIndex = -1;
            let rarityTokenCount = 0;

            for (let i = args.length; i > 0; i--) {
                const normCandidate = normalizeName(args.slice(0, i).join(" "));
                const index = RARITY_ORDER.findIndex(r => normalizeName(r) === normCandidate);

                if (index !== -1) {
                    rarityIndex = index;
                    rarityTokenCount = i;
                    break;
                }
            }

            if (rarityIndex === -1 && !isNaN(args[0])) {
                const num = parseInt(args[0]);

                if (RARITY_ORDER[num]) {
                    rarityIndex = num;
                    rarityTokenCount = 1;
                }
            }

            if (rarityIndex === -1) {
                this.systemMessage("Invalid rarity.", "#ff5e5e");
                return;
            }

            const petalName = args.slice(rarityTokenCount).join(" ");
            const index = petalConfigs.findIndex(p => p?.name && normalizeName(p.name) === normalizeName(petalName));

            if (index === -1) {
                this.systemMessage("Petal not found.", "#ff5e5e");
                return;
            }

            const config = petalConfigs[index];
            const tier = config.tiers?.[rarityIndex];

            if (!tier) {
                this.systemMessage(`No data for tier ${rarityIndex}`, "#ff5e5e");
                return;
            }

            const lines = [
                `${RARITY_ORDER[rarityIndex]} ${config.name}:`,
                `- Health: ${formatNumber(tier.health)}`
            ];

            lines.push(Number.isFinite(tier.damage) ? `- Damage: ${formatNumber(tier.damage)}` : "- Damage: special");

            if (tier.count > 1) lines.push(`- Count: ${tier.count}`);

            if (tier.size > 1) lines.push(`- Size: ${tier.size}`);
            if (tier.extraHealth > 0) lines.push(`- Extra Health: ${formatNumber(tier.extraHealth)}`);
            if (tier.constantHeal > 0) lines.push(`- Constant Heal: ${formatNumber(tier.constantHeal)}`);
            if (tier.damageReduction > 0) lines.push(`- Damage Reduction: ${Math.round(tier.damageReduction * 100)}%`);
            if (tier.armor > 0) lines.push(`- Armor: ${formatNumber(tier.armor)}`);

            if (config.description) {
                lines.push(`- ${config.description}`);
            }

            lines.forEach((line, i) => this.systemMessage(line, i === 0 ? tiers[rarityIndex]?.color || "#ffffff" : "#ffffff"));

            if (tier.spawnable) {
                const mob = mobConfigs[tier.spawnable.index];
                const spawnRarity = Math.min(tier.spawnable.rarity, (mob?.tiers?.length ?? 1) - 1);
                const mobTier = mob?.tiers?.[spawnRarity];

                if (mob && mobTier) {
                    this.systemMessage(`Summon ${mob.name}`, "#8fd3ff");
                    this.systemMessage(`damage: ${formatNumber(mobTier.damage)}`, "#8fd3ff");
                    this.systemMessage(`health: ${formatNumber(mobTier.health * 6)}`, "#8fd3ff");
                }
            }

            return;
        }

        // /drops
        if (commandCheck("/drops")) {
            const args = e.substring(6).trim().split(/\s+/).filter(Boolean);

            if (args.length < 2) {
                this.systemMessage("Usage: /drops <rarity> <mob>", "#ffe65d");
                this.systemMessage("Example: /drops common beetle", "#3bedb5");
                return;
            }

            let rarityArg = normalizeName(args[0]);

            const shortcuts = {
                u: "uncommon",
                leg: "legendary",
                ul: "ultra",
                gala: "galaxium",
                trans: "transcestrial",
                null: "nullified",
                final: "finalist",
                epsi: "epsilation",
                izo: "izolational",
                chro: "chronodynamic",
                abs: "absolutefictional"
            };

            if (shortcuts[rarityArg]) {
                rarityArg = shortcuts[rarityArg];
            }

            const normalizedRarityOrder = RARITY_ORDER.map(r => normalizeName(r));

            let rarityIndex;

            if (!isNaN(rarityArg)) {
                rarityIndex = parseInt(rarityArg);
            } else {
                rarityIndex = normalizedRarityOrder.indexOf(rarityArg);
            }

            if (rarityIndex < 0 || rarityIndex >= RARITY_ORDER.length) {
                this.systemMessage(`Invalid rarity: ${args[0]}`, "#DE1F1F");
                return;
            }

            const mob = findMobByName(args.slice(1).join(" "));

            if (!mob) {
                this.systemMessage(`Mob not found: ${args.slice(1).join(" ")}`, "#DE1F1F");
                return;
            }

            const rows = DROP_LOOKUP?.[mob.name]?.[rarityIndex];

            if (!rows || rows.length === 0) {
                this.systemMessage("No drop table found.", "#DE1F1F");
                return;
            }

            this.systemMessage(
                `${RARITY_ORDER[rarityIndex]} ${mob.name}:`,
                tiers[rarityIndex]?.color || "#FFFFFF"
            );

            for (const row of rows) {
                const totalWeight = row.entries.reduce((sum, entry) => sum + entry.weight, 0);

                this.systemMessage("----------------------------------------------", "#FFFFFF");

                for (const entry of row.entries) {
                    const itemRarity = RARITY_ORDER[entry.rarity] ?? `Tier ${entry.rarity}`;

                    this.systemMessage(
                        `- ${itemRarity} ${getItemName(entry.index)}${formatAmount(entry.amount)} : ${formatPercent(entry.weight)}%`,
                        "#FFFFFF"
                    );
                }

                const missing = 100 - totalWeight;

                if (missing > 0.00001) {
                    this.systemMessage(`- Nothing : ${formatPercent(missing)}%`, "#FFFFFF");
                }
            }

            return;
        }

        // /mobcount
        if (commandCheck("/mobcount")) {
            if (!requireAdmin()) return;

            const actual = Array.from(state.entities.values()).filter(e =>
                e.type === ENTITY_TYPES.MOB &&
                !e.friendly &&
                e.countsTowardsMobCount &&
                !e.health?.isDead
            ).length;

            this.systemMessage(
                `livingMobCount: ${state.livingMobCount} | Actual mobs: ${actual} | maxMobs: ${state.maxMobs} | Difference: ${state.livingMobCount - actual}`,
                actual === state.livingMobCount ? "#55ff55" : "#ff5555"
            );

            return;
        }

        // /spawnmob
        if (commandCheck("/spawnmob")) {
            if (!requireAdmin()) return;

            const args = e.substring(9).trim().split(/\s+/).filter(Boolean);

            if (args.length < 4) {
                this.systemMessage("Usage: /spawnmob [rarity] [mob] [x] [y] <amount>", "#ffaa00");
                return;
            }

            const rawRarity = args.shift();

            let rarityIndex = null;

            if (!isNaN(rawRarity)) {
                rarityIndex = parseInt(rawRarity, 10);
            } else {
                const lower = rawRarity.toLowerCase();

                for (let i = 0; i < tiers.length; i++) {
                    if (tiers[i].name.toLowerCase() === lower) {
                        rarityIndex = i;
                        break;
                    }
                }
            }

            if (rarityIndex == null || rarityIndex < 0 || rarityIndex >= tiers.length) {
                this.systemMessage("Invalid rarity.", "#ff5555");
                return;
            }

            let amount = 1;
            let x;
            let y;

            if (args.length >= 4 && !isNaN(args.at(-1)) && !isNaN(args.at(-2)) && !isNaN(args.at(-3))) {
                amount = Math.max(1, parseInt(args.pop(), 10));
                y = Number(args.pop());
                x = Number(args.pop());
            } else if (args.length >= 3 && !isNaN(args.at(-1)) && !isNaN(args.at(-2))) {
                y = Number(args.pop());
                x = Number(args.pop());
            } else {
                this.systemMessage("Coordinates required. Usage: /spawnmob [rarity] [mob] [x] [y] <amount>", "#ff5555");
                return;
            }

            const mobName = args.join(" ");
            const typeIndex = mobConfigs.findIndex(m => m?.name?.toLowerCase() === mobName.toLowerCase());

            if (typeIndex === -1) {
                this.systemMessage(`Mob "${mobName}" not found.`, "#ff5555");
                return;
            }

            const config = mobConfigs[typeIndex];
            let spawned = 0;

            for (let i = 0; i < amount; i++) {
                try {
                    const mob = new Mob({ x, y });
                    mob.define(config, rarityIndex);
                    mob.x = x;
                    mob.y = y;
                    spawned++;
                } catch (err) {
                    console.error("[spawnmob]", mobName, rarityIndex, err);
                }
            }

            this.systemMessage(
                `Spawned ${spawned} ${tiers[rarityIndex].name} ${config.name}${spawned !== 1 ? "s" : ""}.`,
                "#55ff55"
            );

            return;
        }

        // /godmode
        if (commandCheck("/godmode")) {
            if (!requireAdmin()) return;

            if (!this.body) {
                this.systemMessage("You need to be alive to use this command.", "#ff5555");
                return;
            }

            this.body.setGodmode(!this.body._godmode);
            console.log(`[gm] ${this.username} godmode ${this.body._godmode ? "on" : "off"} via chat`);
            this.systemMessage(
                `Godmode ${this.body._godmode ? "enabled" : "disabled"}.`,
                "#55ff55"
            );

            return;
        }

        // /die
        if (commandCheck("/die")) {
            if (this.body) {
                this.body.destroy();
                return;
            }

            this.systemMessage("You are already dead.", "#ff5555");
            return;
        }

        // /killmob
        if (commandCheck("/killmob")) {
            if (!requireAdmin()) return;

            const raw = e.substring(8).trim();

            if (!raw) {
                this.systemMessage("Usage: /killmob <mobID>", "#ffaa00");
                return;
            }

            const mobID = parseInt(raw);

            if (isNaN(mobID)) {
                this.systemMessage("Invalid mob ID.", "#ff5555");
                return;
            }

            let target = null;

            for (const ent of state.entities.values()) {
                if (ent.type === ENTITY_TYPES.MOB && ent.id === mobID) {
                    target = ent;
                    break;
                }
            }

            if (!target) {
                this.systemMessage(`Mob with ID ${mobID} not found.`, "#ff5555");
                return;
            }

            if (target.health && !target.health.isDead) {
                target.health.set(0);
                this.systemMessage(`Mob ${mobID} killed successfully.`, "#55ff55");
            } else {
                this.systemMessage(`Mob ${mobID} is already dead.`, "#ffaa00");
            }

            return;
        }

        // /killall
        if (commandCheck("/killall")) {
            if (!requireAdmin()) return;

            const args = e.substring(8).trim().split(/\s+/);

            if (args.length < 1 || !args[0]) {
                this.systemMessage("Usage: /killall [rarity] <mobname>", "#ffaa00");
                return;
            }

            const rarityArg = args[0];
            const mobArg = args.slice(1).join(" ");

            let rarityValue = null;

            if (!isNaN(rarityArg)) {
                rarityValue = parseInt(rarityArg);
            } else {
                const lower = rarityArg.toLowerCase();

                for (let i = 0; i < tiers.length; i++) {
                    if (tiers[i].name.toLowerCase() === lower) {
                        rarityValue = i;
                        break;
                    }
                }
            }

            if (rarityValue === null) {
                this.systemMessage(`Rarity "${rarityArg}" not found.`, "#ff5555");
                return;
            }

            let mobName = null;

            if (mobArg) {
                mobName = mobArg.toLowerCase();

                if (!mobConfigs.some(m => m?.name?.toLowerCase() === mobName)) {
                    this.systemMessage(`Mob "${mobArg}" not found.`, "#ff5555");
                    return;
                }
            }

            let killed = 0;

            for (const ent of state.entities.values()) {
                if (ent.type !== ENTITY_TYPES.MOB || ent.rarity !== rarityValue) continue;

                if (mobName !== null && ent.config?.name?.toLowerCase() !== mobName && ent.name?.toLowerCase() !== mobName) continue;

                if (ent.health && ent.parent?.type !== ENTITY_TYPES.PLAYER && ent.team === -69 && !ent.health.isDead) {
                    ent.health.set(0);
                    killed++;
                }
            }

            this.systemMessage(`${killed} mobs killed.`, "#55ff55");

            return;
        }

        // /resetmobs
        if (commandCheck("/resetmobs")) {
            if (!requireAdmin()) return;

            const mobs = [];

            for (const ent of state.entities.values()) {
                if (ent.type === ENTITY_TYPES.MOB && ent.health && !ent.health.isDead) {
                    mobs.push(ent);
                }
            }

            const total = mobs.length;

            this.systemMessage(`Resetting ${total} mobs in batches...`, "#ffaa00");

            let index = 0;

            const interval = setInterval(() => {
                let killed = 0;

                while (index < mobs.length && killed < 50) {
                    mobs[index++].health?.set?.(0);
                    killed++;
                }

                if (index >= mobs.length) {
                    clearInterval(interval);
                    this.systemMessage(`Finished. Removed ${total} mobs.`, "#55ff55");
                }
            }, 50);

            return;
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
            case CLIENT_BOUND.CRAFT_INIT: // Craft init packet
                if (!state.useCraftingProtocol) {
                    return;
                }

                // Also send pity data
                for (let i = 0; i < tiers.length; i++) {
                    for (let j = 0; j < petalConfigs.length; j++) {
                        this.craftAttempts[tiers[i].name] ??= {};
                        this.craftAttempts[tiers[i].name][j] ??= 0;
                        const attempts = this.craftAttempts[tiers[i].name][j];
                        writer.setFloat32(craftManager.calculateChance(i, attempts));
                    }
                }
                break;
            case CLIENT_BOUND.CRAFT_RESULT: // Craft result packet
                if (!state.useCraftingProtocol) {
                    return;
                }

                if (data.error) {
                    writer.setUint8(1);
                    writer.setStringUTF8(data.errorMsg);
                } else {
                    writer.setUint8(0);
                    writer.setUint8(data.rarity);
                    writer.setUint8(data.petalId);
                    writer.setUint32(data.crafted);
                    writer.setUint32(data.attempts);
                    writer.setFloat32(data.pity);
                }
                break;
        }

        state.router.postMessage(writer.build());
    }

    onClose() {
        if (this.verified) {
            console.log(`Client ${this.id} (${this.username}) disconnected.`);

            const onlineCount = state.clients.size - 1;

            state.clients.forEach(client => {
                if (client !== this) client.systemMessage(`${this.username} has left the game. (${onlineCount} players online)`, "#00f2ff");
            });

            this.body?.destroy();

            accounts.saveClient(this);
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
            writer.setStringUTF8(entity.lootName());
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

        const tracked = state.alivePlayers.slice(0, 255);
        writer.setUint8(0xFE);
        writer.setUint8(tracked.length);

        for (const entity of tracked) {
            writer.setUint32(entity.body?.id ?? 0);
            writer.setFloat32(entity.body?.x ?? 0);
            writer.setFloat32(entity.body?.y ?? 0);
        }

        if (state.gamemode === GAMEMODES.MAZE) {
            const alliesWriter = new Writer(true);
            alliesWriter.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
            alliesWriter.setUint16(this.id);
            alliesWriter.setUint8(251);
            alliesWriter.setUint8(state.alivePlayers.length);

            for (const entity of state.alivePlayers) {
                alliesWriter.setUint32(entity.body?.id ?? 0);
                alliesWriter.setFloat32(entity.body?.x ?? 0);
                alliesWriter.setFloat32(entity.body?.y ?? 0);
                alliesWriter.setUint8(entity.team);
                alliesWriter.setUint8(entity.highestRarity);
                alliesWriter.setStringUTF8(entity.lootName());
            }

            state.router.postMessage(alliesWriter.build());
        }

        const worldPacket = writer.build();

        state.router.postMessage(worldPacket);

        if (state.gamemode === GAMEMODES.MAZE) {
            const dropAmountsWriter = new Writer(true);
            dropAmountsWriter.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
            dropAmountsWriter.setUint16(this.id);
            dropAmountsWriter.setUint8(250);
            dropAmountsWriter.setUint16(this.camera.dropAmounts.size);

            this.camera.dropAmounts.forEach((amount, id) => {
                dropAmountsWriter.setUint32(id);
                dropAmountsWriter.setUint32(amount);
                dropAmountsWriter.setUint16(0);
            });

            state.router.postMessage(dropAmountsWriter.build());
        }

        if (globalThis._MAP_CELLS?.length) {
            this.__sentTerrainScores ??= false;

            if (!this.__sentTerrainScores) {
                this.__sentTerrainScores = true;

                const cells = globalThis._MAP_CELLS ?? [];

                const terrainWriter = new Writer(true);

                terrainWriter.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
                terrainWriter.setUint16(this.id);
                terrainWriter.setUint8(CLIENT_BOUND.TERRAIN_SCORES);

                terrainWriter.setUint32(cells.length);

                for (const cell of cells) {
                    terrainWriter.setUint32(cell.x);
                    terrainWriter.setUint32(cell.y);
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
