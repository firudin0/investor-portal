# -*- coding: utf-8 -*-
# One-time generator: builds backend/src/data/program-items.json and
# incentives.json from docs/dovlet-proqrami.pdf (manually transcribed from
# the extracted text, section 8, pages 20-47). Not part of the running app.
import json, os

GLOSSARY = {
    "ADSEA": "Azərbaycan Dövlət Su Ehtiyatları Agentliyi",
    "AİBNDA": "Antiinhisar və İstehlak Bazarına Nəzarət Dövlət Agentliyi",
    "AMB": "Azərbaycan Respublikasının Mərkəzi Bankı",
    "AQTA": "Azərbaycan Respublikasının Qida Təhlükəsizliyi Agentliyi",
    "ASF": "Aqrar Sığorta Fondu",
    "Azərişıq ASC": "\"Azərişıq\" Açıq Səhmdar Cəmiyyəti",
    "DGK": "Azərbaycan Respublikasının Dövlət Gömrük Komitəsi",
    "DİM": "Azərbaycan Respublikasının Dövlət İmtahan Mərkəzi",
    "DİN": "Azərbaycan Respublikasının Daxili İşlər Nazirliyi",
    "DSK": "Azərbaycan Respublikasının Dövlət Statistika Komitəsi",
    "DSX": "Azərbaycan Respublikasının Dövlət Sərhəd Xidməti",
    "EN": "Azərbaycan Respublikasının Energetika Nazirliyi",
    "ETN": "Azərbaycan Respublikasının Elm və Təhsil Nazirliyi",
    "ETSN": "Azərbaycan Respublikasının Ekologiya və Təbii Sərvətlər Nazirliyi",
    "ƏƏSMN": "Azərbaycan Respublikasının Əmək və Əhalinin Sosial Müdafiəsi Nazirliyi",
    "İN": "Azərbaycan Respublikasının İqtisadiyyat Nazirliyi",
    "KTN": "Azərbaycan Respublikasının Kənd Təsərrüfatı Nazirliyi",
    "MdN": "Azərbaycan Respublikasının Mədəniyyət Nazirliyi",
    "NK": "Azərbaycan Respublikasının Nazirlər Kabineti",
    "NMRNK": "Naxçıvan Muxtar Respublikasının Nazirlər Kabineti",
    "RİNN": "Azərbaycan Respublikasının Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi",
    "YİHO": "Yerli İcra Hakimiyyəti Orqanları",
}

def names(codes_str):
    if not codes_str:
        return []
    out = []
    for c in [x.strip() for x in codes_str.split(",") if x.strip()]:
        out.append(GLOSSARY.get(c, c))
    return out

# Each tuple: (bend_no, title, executor_code, other_codes, muddet, yekun_netice, sahe_tags, keywords)
ITEMS = [
("8.1.1.1","Kənd təsərrüfatı təyinatlı torpaqların münbitliyinin qorunması məqsədilə interaktiv nəzarət mexanizminin tətbiq edilməsi","KTN","İN, ETSN, YİHO","2026-2030","Ölkə üzrə interaktiv nəzarət mexanizminin tətbiqinə başlanılması",["torpaq"],["torpaq","munbitlik","suni-intellekt"]),
("8.1.1.2","Kənd təsərrüfatı təyinatlı torpaqların münbitliyinin pozulması hallarında bərpayönümlü (rekultivasiya) tədbirlərin görülməsi mexanizminin yaradılması və tətbiq edilməsi","KTN","İN, ETSN","2026-2030","Bərpayönümlü (rekultivasiya) tədbirlərinin görülməsi nəticəsində torpaqların münbitliyinin artırılması",["torpaq"],["torpaq","rekultivasiya","munbitlik"]),
("8.1.1.3","Torpaqların konsolidasiyası mexanizminin yaradılması və pilot layihə olaraq tətbiq edilməsi","KTN","İN, ADSEA","2026-2030","Seçilmiş 2 pilot rayonda (Qəbələ və Salyan) 20 min hektar sahədə torpaqların konsolidasiyası və təsərrüfatdaxili suvarma şəbəkəsinin qurulması, su resurslarından istifadənin effektiv idarə olunması ilə bağlı yeni pilot modelin tətbiq edilməsi",["torpaq","suvarma"],["torpaq","konsolidasiya","suvarma"]),
("8.1.1.4","Əkin sahələrinin aqrokimyəvi göstəricilər əsasında xəritələşdirilməsi","KTN","İN","2026-2030","Ölkə üzrə əkin sahələrinin aqrokimyəvi xəritələrinin hazırlanması",["torpaq"],["torpaq","aqrokimya","xəritələşdirmə"]),
("8.1.1.5","Torpaq analizi sisteminin müasirləşdirilməsi","KTN","","2026-2030","Ümumilikdə 11 dövlət laboratoriyasının texniki müasirləşdirilməsinin başa çatdırılması",["torpaq"],["torpaq","laboratoriya","analiz"]),
("8.1.1.6","Örüş və otlaq sahələrinin effektiv idarə edilməsi sisteminin yaradılması və münbitliyinin bərpası","KTN","İN, ETSN","2027-2030","Ümumilikdə 480 min ha örüş və otlaq sahələrinin münbitliyinin yaxşılaşdırılması","örüş və otlaqların münbitliyinin qorunması üçün subsidiya mexanizminin tətbiq edilməsi".__class__ and ["heyvandarlıq","torpaq"],["oruş","otlaq","subsidiya"]),
("8.1.2.1","Müasir suvarma sistemlərinin tətbiqinin genişləndirilməsi","KTN","İN, ADSEA, digər aidiyyəti orqanlar (qurumlar)","2026-2030","Ölkə üzrə əkin sahələrinin 300 min hektarında müasir suvarma sistemlərinin tətbiq edilməsi",["suvarma"],["suvarma","damlama","guzeştli-satiş"]),
("8.1.2.2","Suvarma suyunun keyfiyyət monitorinqi və idarəetmə sisteminin yaradılması","ADSEA","KTN, İN","2028-2030","Əsas irriqasiya və meliorasiya şəbəkələri üzrə su keyfiyyəti monitorinqi sisteminin tətbiq edilməsi",["suvarma"],["suvarma","su-keyfiyyəti","monitorinq"]),
("8.1.2.3","Suvarma suyunun və təsərrüfatdaxili suvarma şəbəkəsinin idarə edilməsi üzrə institusional potensialın gücləndirilməsi","KTN","ADSEA","2026-2030","Su resurslarının səmərəli idarəetmə sisteminin formalaşdırılması",["suvarma"],["suvarma","su-istifadəçiləri-birliyi"]),
("8.1.3.1","Kənd təsərrüfatında bərpa olunan enerji mənbələrindən istifadənin təşviqi","KTN","EN","2027-2030","Bərpa olunan enerji mənbələrindən istifadə edən təsərrüfatların sayının 15-ə çatdırılması",["enerji"],["bərpa-olunan-enerji","günəş","dəstək"]),
("8.1.3.2","Aqrar sektorda istilik effekti yaradan emissiyaların monitorinqi və hesabatlıq sisteminin yaradılması","KTN","ETSN","2028-2030","Aqrar sektorda istilik effekti yaradan emissiyaların monitorinqi və hesabatlıq sisteminin tətbiq edilməsi",["ekologiya"],["emissiya","monitorinq","iqlim"]),
("8.1.3.3","Ölkədə ənənəvi ərzaq və kənd təsərrüfatı sistemlərinin dayanıqlılığının təmin edilməsi üzrə pilot layihənin həyata keçirilməsi","KTN","AQTA, İN, YİHO","2027-2028","Azı 3 NİAHS (Milli Əhəmiyyətli Aqrar İrs Sistemi) məntəqəsinin müəyyən edilməsi",["ekologiya"],["aqrar-iras","niahs","dayaniqlilik"]),
("8.1.3.4","İqlim dəyişikliklərinə həssas regionlar üzrə erkən xəbərdarlıq sisteminin qurulması","KTN","ETSN, ADSEA","2027-2030","Prioritetləşmiş regionlar üzrə erkən xəbərdarlıq sistemlərinin qurulması",["ekologiya"],["iqlim","erkən-xəbərdarlıq"]),
("8.1.4.1","Toxumçuluğun (tingçiliyin) inkişafı üzrə hüquqi, institusional və dəstək tədbirlərinin hazırlanması və icra edilməsi","KTN","","2026-2030","Toxum istehsalının artırılması, bu sahədə özünütəminatın yaxşılaşdırılması",["toxumçuluq"],["toxum","tingçilik","subsidiya"]),
("8.1.4.2","Toxumçuluq (o cümlədən tingçilik) sahəsində keyfiyyətə nəzarət sisteminin gücləndirilməsi","KTN","AİBNDA, İN, AQTA","2026-2030","Toxumçuluq (o cümlədən tingçilik) sahəsində qurulmuş mütərəqqi sistem vasitəsilə keyfiyyətə və dövriyyəyə nəzarətin təmin edilməsi",["toxumçuluq"],["toxum","keyfiyyət-nəzarəti"]),
("8.1.4.3","Bitkiçilik sahəsində seleksiya nailiyyətlərinin uçotu və onlara nəzarət sisteminin gücləndirilməsi, seleksiya proqramlarının icra edilməsi","KTN","","2026-2030","Seleksiya proqramlarının müasir metodlar tətbiq edilməklə həyata keçirilməsi",["bitkiçilik"],["seleksiya","patent","toxum"]),
("8.1.4.4","Heyvandarlıq və balıqçılıq sahəsində seleksiya və damazlıq proqramlarının icra edilməsi","KTN","","2026-2030","Heyvandarlıq və balıqçılıq sahəsində müasir metodlara əsaslanan seleksiya və damazlıq proqramlarının həyata keçirilməsi",["heyvandarlıq","balıqçılıq"],["damazlıq","seleksiya"]),
("8.1.4.5","Yerli heyvan cinsləri və bitki növlərinin genetik ehtiyatları üzrə təkmil genetik materiallar banklarının (kolleksiyaların) yaradılması","KTN, ETN","ETSN","2026-2030","Ölkədə mövcud olan, xüsusilə də itmək təhlükəsi olan aborigen heyvan cinsləri və bitki növləri üzrə genetik materialların bankları və bununla bağlı məlumat bazalarının yaradılması",["heyvandarlıq","bitkiçilik"],["genetik-bank","aborigen-cins"]),
("8.1.4.6","Milli atçılıq irsinin qorunması","KTN","MdN, DSX","2026-2030","Yerli at cinslərinin təmizqanlılığının qorunması, işğaldan azad edilmiş ərazilərdə atçılıq zavodunun yaradılması, atçılıq sahəsində yarış infrastrukturunun yaxşılaşdırılması",["heyvandarlıq"],["atçılıq","qarabağ-ati"]),
("8.2.1.1","Heyvandarlıq sahəsində normativ hüquqi aktların yenilənməsi","KTN","AQTA, İN","2026-2030","Heyvandarlıq və heyvan sağlamlığı üzrə beynəlxalq standartlara uyğun normativ hüquqi bazanın və texniki tənzimləmə sisteminin tətbiq edilməsi",["heyvandarlıq","baytarlıq"],["heyvandarlıq","standart"]),
("8.2.1.2","Heyvan sağlamlığı üzrə göstərilən dövlət xidmətləri, eləcə də baytarlıq preparatları ilə təminat və xəstə heyvanların emal və utilizasiya infrastrukturunun inkişaf etdirilməsi","KTN, AQTA","İN","2026-2030","Heyvan xəstəliklərinin monitorinqi və vaksin izlənməsi üzrə rəqəmsal sistemin tətbiqi və baytarlıq xidmətlərinə əlçatanlığın artırılması",["baytarlıq"],["baytarlıq","vaksin","dövlət-sanitar-mussisəsi"]),
("8.2.1.3","Bitkiçilik sahəsində zərərli orqanizmlərin aşkarlanması sisteminin tətbiq edilməsi","KTN","AQTA","2026-2030","Qurulmuş xəbərdarlıq və monitorinq sisteminin məlumatları əsasında zərərvericilər və xəstəliklər barədə vaxtında proqnozların verilməsi",["bitkiçilik"],["zərərverici","fitosanitar"]),
("8.2.1.4","İnteqrir bitki mühafizə tədbirlərindən istifadənin genişləndirilməsi","KTN","","2026-2030","İnteqrir mübarizə üsullarını tətbiq edən fermerlərin sayının artırılması",["bitkiçilik"],["bitki-muhafizesi","dəstək"]),
("8.2.1.5","Bitki mühafizəsi və fumiqasiya (zərərsizləşdirmə) işlərinin infrastruktur təminatının yaxşılaşdırılması","KTN","AQTA","2026-2028","Bitki mühafizəsi və fumiqasiya işinin icrasının və monitorinqinin təmin edilməsi üçün proqram təminatının və müvafiq infrastrukturun qurulması",["bitkiçilik"],["fumiqasiya","zərərsizləşdirmə"]),
("8.2.1.6","Ölkə üzrə bütün iribuynuzlu və xırdabuynuzlu heyvanların dövlət hesabına birdəfəlik identifikasiyasının təşkili və elektron uçotunun aparılması","AQTA","KTN","2027-2030","İribuynuzlu və xırdabuynuzlu heyvanların identifikasiyasının yekunlaşdırılması",["heyvandarlıq"],["identifikasiya","elektron-uçot","dövlət-hesabına"]),
("8.2.2.1","Maliyyə institutlarının aqrar kreditləşmə ilə bağlı müraciətlərinin qiymətləndirilməsi imkanlarının gücləndirilməsi","KTN","İN, Tövsiyə olunur: AMB","2026-2027","Maliyyə institutlarının məlumat ehtiyaclarının ödənilməsi sisteminin formalaşdırılması, aqrar sektor üzrə ixtisaslaşmış mütəxəssislərin sayının artırılması",["maliyyə"],["kredit","bank"]),
("8.2.2.2","Fermerlərin güzəştli kreditlərə çıxışının yaxşılaşdırılması, kredit, zəmanət və faiz subsidiyası mexanizmlərinin genişləndirilməsi","KTN","Tövsiyə olunur: AMB, İN","2026-2030","Fermerlərin maliyyə resurslarına əlçatanlığının artırılması",["maliyyə"],["guzeştli-kredit","zamanet","faiz-subsidiyasi"]),
("8.2.2.3","Aqrar Kredit Kooperativlərinin (AKK) və onların ittifaqının yaradılması, fəaliyyətinin dəstəklənməsi","KTN","Tövsiyə olunur: AMB","2027-2030","Kollektiv kreditləşmə modeli əsasında fəaliyyət göstərən dayanıqlı aqrar kredit kooperativləri sisteminin formalaşdırılması",["maliyyə"],["kredit-kooperativi","akk"]),
("8.2.2.4","Aqrar istehsal və emal sektorunda tətbiq edilən güzəştli kreditləşmə mexanizminin genişləndirilməsi","İN","KTN","2026-2030","Prioritet istiqamətlər üzrə maliyyələşdirilmiş investisiya layihələrinin sayının artırılması (\"Azərbaycan Biznesinin İnkişafı Fondu\" ASC vasitəsilə)",["maliyyə","emal"],["guzeştli-kredit","aibf","investisiya"]),
("8.2.2.5","Aqrar sığorta və subsidiya mexanizmlərinin koordinasiyasının gücləndirilməsi","ASF","KTN","2026-2027","Subsidiya və aqrar sığorta mexanizmlərinin koordinasiya səviyyəsinin artırılması və sığorta ödənişlərinin operativliyinin təmin edilməsi",["sığorta"],["aqrar-sigorta","subsidiya"]),
("8.2.2.6","Aqrar sığortanın əhatə dairəsinin genişləndirilməsi","ASF","KTN","2026-2030","Aqrar sığorta mexanizmi çərçivəsində təminat verilən sığorta predmetlərinin və risklərin sayının artırılması (bitkiçilik, heyvandarlıq, balıqçılıq)",["sığorta"],["aqrar-sigorta","risk"]),
("8.2.2.7","\"Aqrar sığorta\" informasiya sisteminin funksional imkanlarının genişləndirilməsi","ASF","KTN","2026-2030","Aqrar sığorta xidmətlərinin tam elektron formada icra edilməsi, əlçatanlığın artırılması",["sığorta"],["asis","elektron-sigorta"]),
("8.2.2.8","Aqrar sığorta sahəsi üzrə risk və zərərlərin qiymətləndirilməsi metodologiyasının və müstəqil ekspertlər institutunun inkişaf etdirilməsi","ASF","KTN, DİM","2026-2030","Aqrar sığorta sahəsi üzrə risk xəritələrinin hazırlanması, zərərlərin qiymətləndirilməsi metodologiyalarının tətbiqi, azı 100 müstəqil ekspertin fəaliyyət göstərməsi",["sığorta"],["risk-xəritəsi","ekspert"]),
("8.2.2.9","Aqrar sığorta haqlarının dövlət hesabına ödənilən hissəsinin subyektlər, predmet və risklərə münasibətdə diferensiallaşdırılması","ASF","KTN","2026-2030","Aqrar sahədə diferensiallaşdırılmış sığorta sisteminin tam tətbiq edilməsi",["sığorta"],["sigorta-haqqi-subsidiyasi","dovlet-destegi"]),
("8.2.3.1","Aqrar informasiya-məsləhət sisteminin formalaşdırılması","KTN","","2027-2030","Ölkə üzrə informasiya-məsləhət xidmətləri şəbəkəsinin yaradılması",["məsləhət"],["informasiya-mesleht","danışıqçı"]),
("8.2.3.2","Aqroekoloji məlumatlar əsasında bölgələrin müxtəlif məhsullar üzrə ixtisaslaşmasının aparılması və fermerlərin məlumatlandırılması","KTN","ETSN","2027-2030","Ölkədə aqrar məhsullar üzrə ixtisaslaşmanın tamamlanması və fermerlərin məlumatlılıq səviyyəsinin artırılması",["məsləhət"],["aqroekologiya","ixtisaslaşma"]),
("8.2.3.3","Orqanik kənd təsərrüfatı məhsulları istehsalı ilə bağlı fermerlərin məlumatlandırılması","KTN","AQTA, İN","2027-2030","Orqanik kənd təsərrüfatı ilə bağlı nümunəvi təsərrüfat modellərinin formalaşdırılması, fermerlərin orqanik təsərrüfatçılıqla bağlı məlumatlılıq səviyyəsinin artırılması",["orqanik"],["orqanik-kend-teserrufati","pilot"]),
("8.3.1.1","Pambıq emalı sənayesinin inkişaf etdirilməsi","İN","KTN","2026-2030","Pambıq mahlıcının iplik istehsalına yönəldilən hissəsinin, eləcə də ipliyin parça istehsalına yönəldilən hissəsinin artırılması (iplik/parça istehsalına güzəştli kreditlər, pambıq mahlıcı/ipliyi üçün məhsul subsidiyası)",["emal","pambıq"],["pambiq","iplik","mehsul-subsidiyasi"]),
("8.3.1.2","Bitki yağlarının istehsalı klasterinin formalaşdırılmasının təşviqi","KTN","İN","2026-2030","Azı 2 bitki yağı emalı zavodunun yaradılması",["emal"],["bitki-yagi","klaster","investisiya-teşviqi"]),
("8.3.1.3","Şərab istehsalının təşviqi","KTN","İN","2026-2030","Kiçik butik tipli şərab istehsalçılarının sayının 20-yə çatdırılması",["emal","üzümçülük"],["sarab","boutik"]),
("8.3.1.4","Meyvə-tərəvəz məhsullarının emalı sahələrinin inkişafının təşviqi","KTN","İN","2026-2030","Emal edilən meyvə-tərəvəz məhsullarının həcminin davamlı artması (emala yönələn xammala məhsul subsidiyası)",["emal","meyvə-tərəvəz"],["meyve-tereveze-emal","mehsul-subsidiyasi"]),
("8.3.1.5","Süd emalı sahələrinin inkişafının təşviqi","KTN","İN","2026-2030","Emal edilən yerli südün həcminin davamlı artması (emala yönəlmiş südə subsidiya, müddətli vergi güzəştləri)",["emal","süd"],["sud-emali","vergi-guzeşti","subsidiya"]),
("8.3.1.6","Ət məhsulları emalı sahələrinin inkişafının təşviqi","KTN","İN","2026-2030","Ət və ət məhsulları istehsalının həcminin davamlı artması (kəsimxanada kəsilən iribuynuzlu heyvanlara subsidiya, müddətli vergi güzəştləri)",["emal","ət"],["et-emali","vergi-guzeşti"]),
("8.3.1.7","Gön-dəri və yun xammalının emala yönəldilməsinin dəstəklənməsi","KTN","İN","2027-2030","Emal və ixrac edilən gön-dəri və yunun həcminin davamlı artması (toplama məntəqələri dəstəyi, yun/dəri üçün məhsul subsidiyası)",["emal"],["yun","gon-deri","mehsul-subsidiyasi"]),
("8.3.2.1","Gübrə istehsalının təşviqi","İN","KTN, AQTA","2027-2030","Gübrə istehsalının artırılması və daxili tələbatın təminat səviyyəsinin yerli istehsal hesabına yüksəldilməsi",["istehsal-vasiteleri"],["gubre","investisiya-teşviqi"]),
("8.3.2.2","Yem istehsalının təşviqi","KTN","İN","2027-2030","Yerli yem istehsalının və yem təminatında yerli istehsalın payının artırılması (vergi və gömrük güzəştləri)",["istehsal-vasiteleri"],["yem","vergi-gomruk-guzeşti"]),
("8.3.3.1","Südtoplama məntəqələrinin logistika infrastrukturunun yaxşılaşdırılması və süd təchizatı zəncirinin dəstəklənməsi","KTN","İN, AQTA","2026-2030","Regionlar üzrə süd təchizatı zəncirinin optimallaşdırılması və sənaye emalına yönəldilən süd həcminin artırılması",["logistika","süd"],["sud-toplama","logistika"]),
("8.3.3.2","Kənd təsərrüfatı təyinatlı soyuducu anbar şəbəkəsinin genişləndirilməsi","KTN","İN","2026-2030","Regionlar üzrə soyuducu anbarların həcminin 100 min ton artırılması",["logistika"],["soyuducu-anbar","infrastruktur-destegi"]),
("8.3.3.3","Taxıl saxlanması üzrə logistika sistemlərinin inkişaf etdirilməsi","KTN","İN","2026-2030","Taxıl saxlanma həcminin azı 150 min kubmetr artırılması",["logistika","taxılçılıq"],["taxil-silosu","dəstək-mexanizmi"]),
("8.3.3.4","Ərzaq məhsullarının dövlət sifarişi ilə satınalma sisteminin institusional və funksional baxımdan gücləndirilməsi","KTN","AİBNDA","2026-2030","Ərzaq məhsullarının mərkəzləşdirilmiş qaydada dövlət büdcəsinin vəsaiti hesabına satın alınması prosesində istehsalçı fermerlərdən və emalçılardan alış payının artırılması",["logistika"],["dovlet-sifarisi","satinalma"]),
("8.3.4.1","İxracyönümlü aqrobizneslər üçün ixracın təşviqi üzrə ünvanlı dəstək mexanizmlərinin yaradılması və icrası","İN, KTN","","2026-2030","Qeyri-ənənəvi xarici bazarlara ixrac həcminin artırılması",["ixrac"],["ixrac-destegi","aqrobiznes"]),
("8.3.4.2","Aqrar istehsal və emal müəssisələrinin kommunal infrastruktura çıxış imkanın artırılması","KTN, İN","\"Azərişıq\" ASC, digər aidiyyəti orqanlar (qurumlar)","2026-2030","Aqrar istehsal və emal müəssisələrinin enerji, su və qaz təminatı infrastrukturunun genişləndirilməsi və kommunal xidmətlərə çıxış imkanlarının artırılması (texniki şərtin alınmasının subsidiyalaşdırılması)",["infrastruktur"],["kommunal-qoşulma","subsidiya"]),
("8.3.4.3","İstixana sahələrinin inkişafı üçün stimullaşdırma mexanizmlərinin tətbiqi","KTN","İN","2026-2030","250 hektar sahədə yeni istixana qurulması (o cümlədən Şərqi Zəngəzurda 122 hektar), fəaliyyətini dayandırmış 250 hektar istixananın modernləşdirilməsi",["istixana"],["istixana","ortulu-sahe","elektrik-qoşulma-subsidiyasi","avadanliq-guzeştli-satiş"]),
("8.3.4.4","İntensiv bağların genişləndirilməsinin dəstəklənməsi","KTN","","2026-2030","Ölkə üzrə intensiv bağların sahəsinin 70 min hektara çatdırılması",["bağçılıq"],["intensiv-bag","dovlet-destegi"]),
("8.3.4.5","Kənd təsərrüfatı məhsulları istehsalçılarının qlobal və regional bazarlarda qəbul edilən sertifikatları əldə etməsi məqsədilə subsidiya mexanizmlərinin formalaşdırılması və tətbiq edilməsi","KTN","İN, AİBNDA, AQTA","2027-2030","Hər il azı 2 istehsalçının qlobal bazarlarda tanınan sertifikat almasının dəstəklənməsi",["ixrac"],["sertifikatlaşdirma","subsidiya"]),
("8.3.4.6","Aqroparkların yeni inkişaf modelinə keçidinin dəstəklənməsi","KTN (Yevlax aqroparkına münasibətdə İN)","","2027-2030","Aqroparklar üzrə istehsal həcminin artırılması, azı 5 aqroparkın ixracyönümlü fəaliyyətinin təmin edilməsi",["aqropark"],["aqropark","ixrac"]),
("8.3.4.7","Yerli aqrar məhsullarının brendləşdirilməsi","KTN","İN","2026-2030","Regional brend statusu əldə etmiş məhsulların sayının artırılması",["brendləşdirmə"],["brend","regional-mehsul"]),
("8.4.1.1","Kənd təsərrüfatında data əsaslı effektiv idarəetmənin təşkili üçün süni intellekt həllərinin genişləndirilməsi","KTN","","2026-2030","Süni intellektdən istifadə etməklə hazırlanan modulların sayının 30-a çatdırılması",["rəqəmsallaşma"],["suni-intellekt","data"]),
("8.4.1.2","EKTİS-in mövcud altsistemlərinin imkanlarının genişləndirilməsi","KTN","RİNN, digər qurumlar","2026-2030","EKTİS-in kənd təsərrüfatı sahəsində fəaliyyət göstərən subyektləri zəruri olan xidmət və informasiyaları təmin edən vahid platformaya çevrilməsi",["rəqəmsallaşma"],["ektis","elektron-platforma"]),
("8.4.1.3","Kənd təsərrüfatı texnikasına texniki nəzarətin institusional təşkilinin təkmilləşdirilməsi və maddi-texniki baza baxımından gücləndirilməsi","KTN","","2026-2030","Kənd təsərrüfatı texnikasına texniki nəzarətin yeni mexanizmlər əsasında təmin edilməsi",["texnika"],["texniki-nezaret"]),
("8.4.1.4","Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyinin tabeliyində fəaliyyət göstərən qurumlarda idarəetmənin səmərəliliyinin artırılması","KTN","","2027-2028","Nazirliyin tabeliyindəki qurumlarda optimallaşdırılmanın aparılması, korporativ idarəetmənin tətbiqi ilə bağlı islahatların həyata keçirilməsi",["idarəetmə"],["institusional-islahat"]),
("8.4.1.5","Aqrar sahədə normativ hüquqi bazanın təkmilləşdirilməsi","KTN","","2026-2027","\"Aqrar sahə haqqında\" Azərbaycan Respublikasının Qanunu layihəsinin hazırlanması və qəbul edilməsi",["idarəetmə"],["qanun","huquqi-baza"]),
("8.4.2.1","İribuynuzlu heyvandarlıqda cins tərkibinin yaxşılaşdırılması və yeni dəstək mexanizmlərinin tətbiqi","KTN","","2026-2030","Yüksək məhsuldar cins heyvanların ümumi sürüdə payının minimum 10 faizə çatması, mal əti istehsalı həcminin 20 faiz, süd istehsalı həcminin 10 faiz artırılması (damazlıq heyvanların güzəştlə satışı, heyvan və məhsul subsidiyası, süni mayalanmada diferensiallaşdırılmış dəstək)",["heyvandarlıq","süd"],["damazliq","guzeştli-satiş","heyvan-subsidiyasi"]),
("8.4.2.2","Qoyunçuluqda cins tərkibinin yaxşılaşdırılmasının, yarım intensiv təsərrüfatların formalaşdırılmasının dəstəklənməsi","KTN","","2026-2030","Qoyun əti istehsalı həcminin azı 9 faiz artırılması (artezian quyularının qazılmasının subsidiyalaşdırılması)",["heyvandarlıq"],["qoyunçuluq","artezian-subsidiyasi"]),
("8.4.2.3","Quşçuluq sahəsinin inkişafının stimullaşdırılması","KTN","İN","2026-2030","Quş əti istehsalının 30 faiz, yumurta istehsalının 27 faiz artırılması (toyuq damı/kəsimxana qurulması dəstəyi, emal müəssisəsi yaradılması dəstəyi)",["heyvandarlıq"],["qusculuq","yumurta","destek-mexanizmi"]),
("8.4.2.4","Kənd təsərrüfatı texnikası və avadanlıqlarının satışına tətbiq olunan güzəşt mexanizmlərinin effektivliyinin artırılması","KTN","İN","2026-2030","Prioritetlərə və ehtiyaclara uyğun olaraq aqrar sahənin texnika və avadanlıqlarla təminatının yaxşılaşdırılması (kombayn, traktor, lazerli mala və s. üçün diferensial güzəşt və güzəştli kreditləşmə)",["texnika"],["texnika-guzeşti","kombayn","traktor"]),
("8.4.2.5","Aqrar istehsal və emal sahələrində vergi siyasətinin dəyər zənciri üzrə optimallaşdırılması","NK","KTN, İN, DGK","2026-2030","Kənd təsərrüfatı və aqrar dəyər zəncirində rəqabətqabiliyyətliliyin, investisiya fəallığının, əlavə dəyərin yaradılmasının və iqtisadi səmərəliliyin artırılması",["vergi"],["vergi-siyaseti","deyer-zenciri"]),
("8.4.2.6","Buğda istehsalının artırılması ilə bağlı stimullaşdırma tədbirlərinin həyata keçirilməsi","KTN","İN","2026-2030","Buğda məhsuldarlığının ixtisaslaşmış rayonlarda 50 sentner/hektara çatdırılması, buğda istehsalı həcminin ölkə üzrə 20 faiz artırılması (lazerli mala tətbiqinin subsidiyalaşdırılması)",["taxılçılıq"],["bugda","lazerli-mala-subsidiyasi"]),
("8.4.2.7","Pambıq istehsalının artırılması ilə bağlı stimullaşdırma tədbirlərinin həyata keçirilməsi","KTN","İN","2026-2030","İxtisaslaşmış rayonlar üzrə pambığın məhsuldarlığının 50 sentner/hektara çatdırılması, pambığın istehsal həcminin 17 faiz artırılması (məhsul istehsalına subsidiya, lazerli mala subsidiyası)",["pambıq"],["pambiq","mehsul-subsidiyasi"]),
("8.4.2.8","Kənd təsərrüfatı fəaliyyəti ilə məşğul olan qadın və gənc fermerlər üçün xüsusi dəstək mexanizmlərinin və layihələrinin həyata keçirilməsi","KTN","İN, AMB","2027-2030","Kənd təsərrüfatı fəaliyyəti ilə məşğul olan qadın və gənc fermerlərin sayının artırılması",["sosial"],["qadin-fermer","genc-fermer"]),
("8.4.2.9","Kənd təsərrüfatında kooperasiyalaşma və assosiasiyaların inkişafının dəstəklənməsi","KTN","İN, NMRNK","2027-2030","Ümumilikdə 5 funksional nümunəvi kooperativin, 3 funksional nümunəvi assosiasiyanın (ittifaqın) fəaliyyətə başlaması",["kooperasiya"],["kooperativ","assosiasiya","dovlet-destegi"]),
("8.4.3.1","Aqrar sahədə ikili diplom proqramlarının genişləndirilməsi və xarici universitetlə birgə universitetin yaradılması","KTN","ETN","2026-2030","Aqrar ixtisaslar üzrə ikili diplom proqramlarından məzun olanların ümumi sayının 500-ə çatdırılması, bir xarici universitetlə əməkdaşlıq çərçivəsində birgə universitetin yaradılması",["təhsil"],["ikili-diplom","tehsil"]),
("8.4.3.2","Aqrar sahə üzrə peşə standartlarının hazırlanması və təhsilin məzmununun yenilənməsi","ƏƏSMN, KTN","ETN, DİM","2026-2030","Azı 30 yeni peşə və kvalifikasiya standartının hazırlanması, azı 10 proqramın kurikulumunun yenilənməsi",["təhsil"],["peşe-standarti","kurikulum"]),
("8.4.3.3","Aqrar sahədə fəaliyyət göstərən mütəxəssislərin reyestrinin yaradılması və onların təlim proqramlarına cəlb edilməsi","KTN","","2027-2030","Aqrar sahədə fəaliyyət göstərən bütün istiqamətlər üzrə mütəxəssislərin reyestrinin yaradılması",["təhsil"],["mutexessis-reyestri","telim"]),
("8.4.3.4","Aqrar sahədə qeyri-formal məşğulluğun azaldılması","KTN, ƏƏSMN","İN, DSK","2026-2027","Kənd təsərrüfatında qeyri-formal məşğulluq səviyyəsinin mərhələli azaldılmasına dair zəruri təkliflərin hazırlanması, normativ hüquqi bazanın təkmilləşdirilməsi",["sosial"],["qeyri-formal-meşğulluq"]),
("8.4.3.5","Elmi tədqiqat institutlarının idarəetmə sistemlərinin modernləşdirilməsi, institusional islahatlar aparılması","KTN","","2026-2027","Beynəlxalq təcrübə nəzərə alınmaqla elmi tədqiqat institutlarının idarəetmə sistemlərinin təkmilləşdirilməsi",["elm"],["elmi-tedqiqat","institusional-islahat"]),
("8.4.3.6","Beynəlxalq elmi tədqiqat mərkəzləri ilə əməkdaşlığın genişləndirilməsi","KTN","","2027-2030","Beynəlxalq tərəfdaş mərkəzlərlə birlikdə azı bir mükəmməllik və innovasiya mərkəzinin yaradılması",["elm"],["beynelxalq-emekdaşliq","innovasiya-merkezi"]),
("8.4.3.7","Aparılan elmi tədqiqatların müasir tələblərə uyğun olaraq keyfiyyətinin yüksəldilməsi və gənclər arasında elmi tədqiqatların aparılmasına marağın artırılması","KTN","","2026-2030","İndeksləşdirilmiş jurnallarda çap olunan məqalələrin sayının 2027-ci ildən başlayaraq hər il 10 faiz artması, aqrar sahədə elmi tədqiqatlarla məşğul olan gənc alimlərin sayının artırılması",["elm"],["elmi-tedqiqat","genc-alim"]),
("8.4.3.8","Elmi tədqiqat institutlarının infrastruktur təminatının yaxşılaşdırılması","KTN","İN","2026-2030","Elmi tədqiqat institutlarının müasir tələblərə uyğun infrastrukturla təminat səviyyəsinin artırılması (o cümlədən balıq və su bioresurs ehtiyatlarının tədqiqi üçün elmi tədqiqat gəmisi)",["elm"],["laboratoriya","infrastruktur"]),
("8.5.1.1","Balıqçılıq və akvakultura sahəsində normativ hüquqi bazanın müasir tələblərə uyğunlaşdırılması","KTN","ETSN","2026-2027","Balıqçılıq və akvakultura sahəsində beynəlxalq standartlara uyğun normativ hüquqi bazanın yaradılması",["balıqçılıq"],["akvakultura","huquqi-baza"]),
("8.5.1.2","Balıqçılıq və akvakultura sahəsində nəzarət və idarəetmə sistemlərinin modernləşdirilməsi və rəqəmsallaşdırılması","KTN","","2026-2028","Balıqçılıq və akvakultura sahəsində sanitariya nəzarəti sisteminin beynəlxalq tələblərə uyğun təşkili, nəzarət və idarəetməni həyata keçirmək üçün informasiya sisteminin yaradılması",["balıqçılıq"],["akvakultura","elektron-izleme"]),
("8.5.1.3","Balıq ovunun dayanıqlı əsaslarla təşkili, izlənməsi və bu sahədə nəzarətin gücləndirilməsi","KTN","DİN, DSX","2026-2030","Balıq ehtiyatlarının qorunması və ekoloji balansın saxlanılması üçün balıq ovunun ekosistemə daha uyğun prinsiplər əsasında aparılması və balıq ovuna nəzarətin təşkil edilməsi",["balıqçılıq"],["baliq-ovu","vetegə"]),
("8.5.1.4","Balıqartırma fəaliyyətinin gücləndirilməsi","KTN","İN","2026-2030","Balıqartırma təsərrüfatının fəaliyyətinin təmin edilməsi (Göygöl/Çaykənd, Ağdərə balıqartırma təsərrüfatları)",["balıqçılıq"],["baliqartirma","tesserrufat"]),
("8.5.2.1","Balıqçılıq sahəsində inkişaf zonalarının müəyyən edilməsi","KTN","","2026-2030","Akvakultura sahəsində 1 aqroparkın yaradılması, zonaların müəyyən edilməsi",["balıqçılıq"],["akvakultura-zona","aqropark"]),
("8.5.2.2","Balıqçılıq sahəsində damazlıq işinin gücləndirilməsi","KTN","","2026-2030","Damazlıq balıqçılıq təsərrüfatının formalaşdırılması",["balıqçılıq"],["damazliq-baliq"]),
("8.5.2.3","Balıqçılıq və akvakultura sahəsində dəstək mexanizminin formalaşdırılması","KTN","İN","2026-2030","Akvakultura subyektlərinin məhsul buraxılışının 7700 tona çatdırılması (balıqçılıq və akvakultura məhsulları istehsalı və emalı sahəsində subsidiya və güzəştlərin tətbiqi)",["balıqçılıq"],["akvakultura-subsidiyasi","guzeşt"]),
]

def main():
    out = []
    for i, (bend_no, title, exec_code, other_codes, muddet, netice, sahe_tags, keywords) in enumerate(ITEMS, start=1):
        out.append({
            "id": f"item-{i:03d}",
            "bend_no": bend_no,
            "title": title,
            "text": title,
            "netice": netice,
            "executor": names(exec_code)[0] if names(exec_code) else exec_code,
            "executor_code": exec_code,
            "other_executors": names(other_codes),
            "other_executor_codes": other_codes,
            "muddet": muddet,
            "sahe_tags": sahe_tags,
            "keywords": keywords,
        })
    target = os.path.join(os.path.dirname(__file__), "..", "backend", "src", "data", "program-items.json")
    with open(target, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"wrote {len(out)} items to {target}")

if __name__ == "__main__":
    main()
