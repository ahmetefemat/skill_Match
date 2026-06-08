from __future__ import annotations

from datetime import date
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt


def _set_section_margins(section, *, top_in=0.75, bottom_in=0.75, left_in=0.75, right_in=0.75):
    section.top_margin = Inches(top_in)
    section.bottom_margin = Inches(bottom_in)
    section.left_margin = Inches(left_in)
    section.right_margin = Inches(right_in)


def _set_section_columns(section, num: int, space_twips: int = 360):
    """Set number of columns for a section.

    python-docx doesn't expose columns directly, so we set the underlying w:cols.
    space_twips: column spacing in twips (1/20 pt). 360 twips ≈ 0.25".
    """

    sect_pr = section._sectPr  # pylint: disable=protected-access
    cols = sect_pr.find(qn("w:cols"))
    if cols is None:
        cols = OxmlElement("w:cols")
        sect_pr.append(cols)

    cols.set(qn("w:num"), str(num))
    cols.set(qn("w:space"), str(space_twips))


def _set_document_defaults(doc: Document):
    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(10)

    # Ensure East Asia fonts inherit correctly in Word
    style.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")


def _p(doc: Document, text: str = "", *, bold: bool = False, italic: bool = False, align=None):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    if align is not None:
        p.alignment = align

    pf = p.paragraph_format
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)
    pf.line_spacing = 1.0
    return p


def _heading(doc: Document, text: str):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.0
    return p


def build_paper(output_path: Path) -> None:
    doc = Document()
    _set_document_defaults(doc)

    # Page setup
    _set_section_margins(doc.sections[0])

    # ---- Title block (single-column) ----
    title = _p(
        doc,
        "SkillMatch: AI Destekli E-Spor Takım Eşleştirme ve Oyuncu Analiz Platformu",
        bold=True,
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )
    title.runs[0].font.size = Pt(14)

    _p(
        doc,
        "Hayrani ER, Mustafa TÜR, Ahmet Efe MAT",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    ).runs[0].font.size = Pt(11)

    _p(
        doc,
        "Ön-Yüz Yazılım Geliştirme, Ege Üniversitesi, İzmir, Türkiye",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )

    _p(
        doc,
        "19240001403@ogrenci.ege.edu.tr, 19240001418@ogrenci.ege.edu.tr, 19240001621@ogrenci.ege.edu.tr",
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )

    _p(doc, "")

    # Abstract (keep IEEE dash style)
    abstract_text = (
        "Abstract—With the growth of the e-sports ecosystem, finding compatible teammates and "
        "tracking performance in a sustainable way has become a key need for competitive players. "
        "Most existing platforms focus on raw statistics, while overlooking critical factors such as "
        "role balance, communication preferences, and team synergy. This paper presents SkillMatch, "
        "a prototype platform that combines real-time match/lobby workflows with player analytics "
        "to support team formation and performance monitoring. The system aggregates multi-dimensional "
        "signals (match history, win/loss outcomes, user preferences, and interaction constraints) to "
        "compute interpretable compatibility indicators and dashboard insights. SkillMatch is built with "
        "a React-based responsive UI and a Firebase-backed data layer, enabling secure authentication, "
        "real-time updates, and auditable transaction logs. The current prototype prioritizes a reliable "
        "data model and real-time UX; the AI-driven recommendation component is designed as an "
        "extensible scoring layer that can evolve toward learned models as richer datasets become available."
    )
    _p(doc, abstract_text)

    _p(
        doc,
        "Keywords—e-sports, matchmaking, team formation, player analytics, Firebase, real-time systems, SkillMatch.",
        italic=False,
    )

    # Switch to two columns for main body
    body_section = doc.add_section(WD_SECTION.CONTINUOUS)
    _set_section_margins(body_section)
    _set_section_columns(body_section, 2, space_twips=360)

    # ---- Main content ----
    _heading(doc, "I. GİRİŞ")
    _p(
        doc,
        "E-spor sektörü son yıllarda hızlı bir büyüme göstermiş ve rekabetçi oyunlar, milyonlarca oyuncunun "
        "düzenli olarak takım tabanlı mücadele ettiği küresel bir ekosistem hâline gelmiştir. Buna rağmen uygun "
        "takım arkadaşı bulma süreci çoğu oyuncu için hâlâ önemli bir sorundur. Rekabetçi oyunlarda başarı, yalnızca "
        "bireysel mekanik beceriye değil; rol dengesi, iletişim kalitesi ve takım içi koordinasyona da doğrudan bağlıdır. "
        "Yaygın eşleştirme yaklaşımları çoğunlukla rütbe (rank) veya benzer tekil metriklere dayanır; bu durum, "
        "oyun tarzı uyumu ve takım sinerjisi gibi çok boyutlu faktörlerin göz ardı edilmesine yol açabilir [1], [2]."
    )
    _p(
        doc,
        "Bu çalışmada, takım bulma ve performans takibini tek bir akışta birleştiren SkillMatch platformu sunulmaktadır. "
        "Platform, gerçek zamanlı lobi/maç ilanları üzerinden etkileşimli bir eşleşme süreci sağlar; buna ek olarak kullanıcı "
        "panelinde (dashboard) maç geçmişinden türetilen istatistikleri görselleştirerek oyuncuların gelişimini takip etmesine "
        "imkân verir. Önerilen yaklaşım, üretim ortamında öğrenen modellerle genişletilebilir biçimde tasarlanmış, "
        "açıklanabilir bir uyumluluk/öneri katmanını hedefler; prototip aşamasında ise güvenli veri modeli ve gerçek zamanlı "
        "UX önceliklendirilmiştir."
    )

    _heading(doc, "II. YÖNTEM VE SİSTEM TASARIMI")

    _heading(doc, "A. Genel Yapı")
    _p(
        doc,
        "SkillMatch, istemci-sunucu yaklaşımını benimseyen katmanlı bir mimari ile geliştirilmiştir. Ön yüz katmanı React "
        "(Vite tabanlı geliştirme akışı) ile inşa edilmiş; durum yönetimi ve sayfa yönlendirmesi modern React kalıpları ile "
        "tasarlanmıştır. Veri katmanında Firebase Authentication kullanıcı oturumunu yönetirken, Cloud Firestore; kullanıcı "
        "profilleri, maç ilanları ve işlem geçmişi gibi verileri saklamak ve gerçek zamanlı dinleme (onSnapshot) akışlarını "
        "desteklemek için kullanılmıştır [5], [6]."
    )

    _heading(doc, "B. Veri Modeli ve Güvenlik")
    _p(
        doc,
        "Uygulama veri modeli dört temel koleksiyona ayrılmıştır: `users` (profil/istatistik), `wallets` (kredi bakiyesi), "
        "`transactions` (denetlenebilir işlem kayıtları) ve `matches` (maç ilanı yaşam döngüsü). Güvenlik açısından Firestore "
        "Security Rules ile kritik yazma işlemleri sınırlandırılmış; istemcinin doğrudan `wallets`, `transactions` ve `matches` "
        "koleksiyonlarında güncelleme yapması engellenmiştir. Bu yaklaşım, üretim senaryosunda maç oluşturma/katılma gibi "
        "atomik iş kurallarının güvenilir bir arka uç (ör. Cloud Functions) tarafından yürütülmesini hedefler. Prototipte "
        "kurallar, emülatör ortamında otomatik testler ile doğrulanmıştır."
    )

    _heading(doc, "C. Eşleştirme Yaklaşımı")
    _p(
        doc,
        "Platformda eşleşme akışı, oyuncuların oluşturduğu maç ilanlarına katılım (lobi mantığı) üzerinden ilerler. İlanlar; "
        "oyun türü, hedef (hedef görev), giriş ücreti ve durum (beklemede/oynanıyor/tamamlandı/iptal) alanlarıyla tanımlanır. "
        "Eşleştirme karar kalitesi artırılmak istendiğinde öneri modülü, aday oyuncular için açıklanabilir bir uyumluluk skoru "
        "hesaplayacak şekilde kurgulanmıştır. Genel formül, normalize edilmiş özelliklerin ağırlıklı toplamı olarak verilebilir: "
        "S(u, v) = Σ_i w_i · x̂_i(u, v)."
    )
    _p(
        doc,
        "Burada x̂_i; rol/oyun tercihi benzerliği, yakın dönem performans göstergeleri, zaman uyumu ve davranışsal kısıtlar gibi "
        "özelliklerin normalize edilmiş değerleridir. Prototipte bu katman, öğrenen bir model olmaksızın; istatistik türetimi ve "
        "kural-tabanlı gösterge üretimi şeklinde uygulanmıştır."
    )

    _heading(doc, "D. Kullanıcı Arayüzü Tasarımı")
    _p(
        doc,
        "Arayüz, lobi akışı ve analitik panel ihtiyaçlarına göre modüler bileşenlerle tasarlanmıştır. Lobby sayfasında aktif "
        "maç ilanları gerçek zamanlı listelenir; kullanıcılar oyun türü ve hedef seçerek ilan açabilir veya mevcut ilana katılabilir. "
        "Dashboard ve Profile sayfalarında maç geçmişi, kazanma oranı ve trend gibi metrikler grafik bileşenleriyle (Chart.js) "
        "sunulur. Tasarımda responsive yaklaşım benimsenmiş ve karanlık tema odaklı bir görünüm hedeflenmiştir."
    )

    _heading(doc, "III. UYGULAMA SÜRECİ")

    _heading(doc, "A. Geliştirme Ortamı ve Teknolojiler")
    _p(
        doc,
        "Uygulama React 19 ve Vite 8 ile geliştirilmiş; yönlendirme için React Router, veri görselleştirme için Chart.js, "
        "stil altyapısı için Tailwind CSS tercih edilmiştir. Firebase SDK; Authentication ve Firestore entegrasyonunu sağlar. "
        "Kod kalitesi ESLint ile kontrol edilmekte, geliştirme sırasında Vite üzerinden hızlı derleme ve HMR kullanılmaktadır."
    )

    _heading(doc, "B. Ön Yüz Akışları")
    _p(
        doc,
        "Kullanıcı akışı Landing → Login/Register → Lobby/Dashboard/Profile şeklinde kurgulanmıştır. Kimlik doğrulama sonrası "
        "korumalı rotalar (PrivateRoute) ile lobi, dashboard, profil ve maç detay ekranlarına erişim sınırlandırılır. Bu yapı, "
        "oturum durumuna göre yönlendirmelerin tutarlı kalmasını sağlar."
    )

    _heading(doc, "C. Firebase Entegrasyonu ve Gerçek Zamanlı Veri")
    _p(
        doc,
        "Kimlik doğrulama Firebase Authentication ile yönetilir. Kayıt sırasında `users` ve `wallets` koleksiyonlarında başlangıç "
        "dokümanları oluşturulur. Lobby ekranında beklemedeki maçlar ve oynanan maçlar, Firestore sorguları üzerinden gerçek zamanlı "
        "dinlenir. Cüzdan hareketleri ve işlem geçmişi, `transactions` koleksiyonundan yine gerçek zamanlı olarak izlenir; böylece kullanıcı "
        "panelinde güncel bakiye/işlem durumu anlık yansıtılır."
    )

    _heading(doc, "D. Test ve Doğrulama")
    _p(
        doc,
        "Güvenlik kuralları, Firestore Emülatörü üzerinde otomatik bir test betiği ile doğrulanmıştır. Testler; yetkisiz yazmaların reddedilmesi, "
        "kullanıcının yalnızca kendi cüzdan/işlemlerini okuyabilmesi ve maç verilerinin yalnızca okunabilir olması gibi kabul kriterlerini kapsar."
    )

    _heading(doc, "IV. ANALİTİK VE (AI) ÖNERİ MODÜLÜ")
    _p(
        doc,
        "Mevcut prototipte analitik modül, maç geçmişinden türetilen performans metriklerini üretir: toplam maç sayısı, galibiyet/mağlubiyet, "
        "kazanma oranı, seri bilgisi ve kısa dönem performans trendi. Bu metrikler, kullanıcı panelinde okunabilir kartlar ve grafiklerle sunulur."
    )
    _p(
        doc,
        "AI tabanlı öneri modülü ise mimari olarak ayrı bir katman şeklinde planlanmıştır. Bir sonraki aşamada; daha zengin veri (rol tercihleri, "
        "iletişim tercihleri, maç içi davranış sinyalleri) toplandığında, ağırlıklı skor fonksiyonunun öğrenen modele (ör. gradient boosting veya "
        "sıralama temelli modeller) evrilmesi hedeflenmektedir. Bu geçiş, skorun açıklanabilirliğini korurken öneri kalitesini artırmayı amaçlar."
    )

    _heading(doc, "V. BULGULAR VE TARTIŞMA")
    _p(
        doc,
        "Geliştirilen prototip, uçtan uca temel kullanıcı senaryolarını desteklemektedir: kullanıcı kaydı/girişi, lobi ilanlarının listelenmesi, "
        "maç durumlarının gerçek zamanlı güncellenmesi ve işlem geçmişinin izlenebilir biçimde tutulması. Analitik panel üzerinden oyuncu, maç geçmişine "
        "dayalı metriklerini takip edebilmekte ve trend grafikleri ile son dönem performansını gözlemleyebilmektedir."
    )
    _p(
        doc,
        "Güvenlik tarafında kuralların emülatör testleri; istemci kaynaklı yetkisiz yazma girişimlerinin engellendiğini göstermektedir. Bununla birlikte, "
        "üretim ortamında maç oluşturma/katılım gibi atomik iş akışlarının tamamen güvenilir bir arka uç tarafından yürütülmesi gereklidir. Bu nedenle, "
        "ilerleyen çalışmalarda Cloud Functions tabanlı bir işleme katmanı ve oyun API’lerinden (ör. Riot) veri çekimi planlanmaktadır."
    )

    _heading(doc, "VI. SONUÇ")
    _p(
        doc,
        "Bu çalışmada, e-spor oyuncularının takım bulma ve performans takibi ihtiyaçlarını tek bir platformda birleştiren SkillMatch prototipi sunulmuştur. "
        "Sistem; gerçek zamanlı lobi/maç akışı, güvenli veri modeli ve analitik dashboard bileşenleriyle kullanıcı deneyimini artırmayı hedeflemektedir. "
        "Öneri/uyumluluk katmanı açıklanabilir bir skor yaklaşımı ile kurgulanmış ve ileride öğrenen modellerle genişletilebilecek şekilde tasarlanmıştır. "
        "Gelecek çalışmalarda, güvenilir arka uç yürütümü, oyun API entegrasyonları ve daha zengin davranışsal sinyallerle öneri kalitesinin artırılması planlanmaktadır."
    )

    _heading(doc, "KAYNAKÇA")

    refs = [
        "[1] A. E. Elo, The Rating of Chessplayers, Past and Present. Arco Publishing, 1978.",
        "[2] M. E. Glickman, \"Parameter Estimation in Large Dynamic Paired Comparison Experiments,\" 1999.",
        "[3] R. Herbrich, T. Minka, and T. Graepel, \"TrueSkill™: A Bayesian Skill Rating System,\" in Advances in Neural Information Processing Systems (NIPS), 2007.",
        "[4] A. Lappas, K. Liu, and E. Terzi, \"Finding a Team of Experts in Social Networks,\" in Proc. ACM SIGKDD, 2009.",
        "[5] Firebase Documentation, \"Firebase Authentication,\" Erişim: Mayıs 2026. https://firebase.google.com/docs/auth",
        "[6] Firebase Documentation, \"Cloud Firestore,\" Erişim: Mayıs 2026. https://firebase.google.com/docs/firestore",
        "[7] React Documentation, \"React,\" Erişim: Mayıs 2026. https://react.dev/",
        "[8] Vite Documentation, \"Vite,\" Erişim: Mayıs 2026. https://vitejs.dev/",
        "[9] Tailwind CSS Documentation, \"Tailwind CSS,\" Erişim: Mayıs 2026. https://tailwindcss.com/",
        "[10] Riot Games Developer Portal, \"Riot Developer Portal Documentation,\" Erişim: Mayıs 2026. https://developer.riotgames.com/",
    ]

    for ref in refs:
        _p(doc, ref)

    _p(doc, "")
    _p(doc, f"(Oluşturma tarihi: {date.today().isoformat()})", italic=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output_path)


def main():
    root = Path(__file__).resolve().parents[1]
    output = root / "Bildiri-Hayrani ER-Mustafa TÜR-Ahmet Efe MAT.docx"
    build_paper(output)
    print(f"Generated: {output}")


if __name__ == "__main__":
    main()
