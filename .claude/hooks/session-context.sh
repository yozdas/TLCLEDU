#!/usr/bin/env bash
# SessionStart hook: her oturum baslangicinda projenin AI alt yapisini ve kod haritasinin
# yerini Claude'a hatirlatir; boylece kor arama yerine dogrudan dogru dosyaya gidilir.

cat <<'CTX'
TLCL Egitim — AI alt yapisi yuklu. Kod ararken once oku:
- .claude/memory/architecture.md  (KOD HARITASI: hangi kod nerede)
- .claude/memory/book-reference.md (referans kitap: assets/TLCL-25.12.pdf)
- .claude/memory/glossary.md       (konvansiyonlar ve tuzaklar)
Kurallar .claude/rules/, is akislari .claude/skills/, alt-ajanlar .claude/agents/ altinda.
Hatirlat: build yok; testler 'bash test.sh'; kokte js/ degisirse en/js/ aynasini da guncelle.
CTX
exit 0
