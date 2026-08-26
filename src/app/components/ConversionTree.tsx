import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

interface Person {
  name: string;
  arabicName?: string;
  children?: Person[];
}

export function ConversionTree() {
  const { language } = useLanguage();
  const t = translations[language].conversionTree;
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    // Center the tree horizontally on load
    if (treeContainerRef.current) {
      const container = treeContainerRef.current;
      container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    }
  }, []);

  // Handle mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!treeContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - treeContainerRef.current.offsetLeft);
    setScrollLeft(treeContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !treeContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - treeContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    treeContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Conversion tree data based on historical Islamic records
  const conversionData: Person = {
    name: language === "en" ? "Prophet Muhammad (ﷺ)" : "মুহাম্মদ (সা.)",
    arabicName: "محمد ﷺ",
    children: [
      {
        name: language === "en" ? "Khadijah bint Khuwaylid" : "খাদিজা বিনতে খুওয়াইলিদ",
        arabicName: "خديجة بنت خويلد",
      },
      {
        name: language === "en" ? "Ali ibn Abi Talib" : "আলী ইবনে আবি তালিব",
        arabicName: "علي بن أبي طالب",
      },
      {
        name: language === "en" ? "Zaid ibn Harithah" : "যায়েদ ইবনে হারিসা",
        arabicName: "زيد بن حارثة",
      },
      {
        name: language === "en" ? "Abu Bakr al-Siddiq" : "আবু বকর আল-সিদ্দিক",
        arabicName: "أبو بكر الصديق",
        children: [
          {
            name: language === "en" ? "Uthman ibn Affan" : "উসমান ইবনে আফফান",
            arabicName: "عثمان بن عفان",
          },
          {
            name: language === "en" ? "Abdur Rahman ibn Auf" : "আবদুর রহমান ইবনে আউফ",
            arabicName: "عبد الرحمن بن عوف",
          },
          {
            name: language === "en" ? "Sa'd ibn Abi Waqqas" : "সা'দ ইবনে আবি ওয়াক্কাস",
            arabicName: "سعد بن أبي وقاص",
          },
          {
            name: language === "en" ? "Talha ibn Ubaydullah" : "তালহা ইবনে উবাইদুল্লাহ",
            arabicName: "طلحة بن عبيد الله",
          },
          {
            name: language === "en" ? "Zubair ibn al-Awwam" : "যুবাইর ইবনুল আউয়াম",
            arabicName: "الزبير بن العوام",
          },
        ],
      },
      {
        name: language === "en" ? "Bilal ibn Rabah" : "বিলাল ইবনে রাবাহ",
        arabicName: "بلال بن رباح",
      },
      {
        name: language === "en" ? "Ammar ibn Yasir" : "আম্মার ইবনে ইয়াসির",
        arabicName: "عمار بن ياسر",
      },
      {
        name: language === "en" ? "Umar ibn al-Khattab" : "উমর ইবনুল খাত্তাব",
        arabicName: "عمر بن الخطاب",
        children: [
          {
            name: language === "en" ? "Sa'id ibn Zaid" : "সাঈদ ইবনে যায়েদ",
            arabicName: "سعيد بن زيد",
          },
        ],
      },
      {
        name: language === "en" ? "Hamza ibn Abdul-Muttalib" : "হামযা ইবনে আবদুল মুত্তালিব",
        arabicName: "حمزة بن عبد المطلب",
      },
      {
        name: language === "en" ? "Ja'far ibn Abi Talib" : "জাফর ইবনে আবি তালিব",
        arabicName: "جعفر بن أبي طالب",
        children: [
          {
            name: language === "en" ? "Asma bint Umays" : "আসমা বিনতে উমাইস",
            arabicName: "أسماء بنت عميس",
          },
        ],
      },
      {
        name: language === "en" ? "Abu Ubaidah ibn al-Jarrah" : "আবু উবাইদা ইবনুল জাররাহ",
        arabicName: "أبو عبيدة بن الجراح",
      },
      {
        name: language === "en" ? "Mus'ab ibn Umayr" : "মুসআব ইবনে উমাইর",
        arabicName: "مصعب بن عمير",
      },
      {
        name: language === "en" ? "Khalid ibn al-Walid" : "খালিদ ইবনুল ওয়ালিদ",
        arabicName: "خالد بن الوليد",
      },
      {
        name: language === "en" ? "Amr ibn al-As" : "আমর ইবনুল আস",
        arabicName: "عمرو بن العاص",
      },
    ],
  };

  const TreeNode = ({ person, isRoot = false }: { person: Person; isRoot?: boolean }) => {
    const hasChildren = person.children && person.children.length > 0;

    return (
      <div className="tree-node-wrapper">
        <div className="tree-node">
          <div className={`node-content ${isRoot ? 'root-node' : ''}`}>
            <div className="name">{person.name}</div>
            {person.arabicName && (
              <div className="arabic-name">{person.arabicName}</div>
            )}
          </div>
          {hasChildren && (
            <div className="arrow-container">
              <ArrowDown className="arrow-icon" size={24} strokeWidth={3} />
            </div>
          )}
        </div>
        {hasChildren && (
          <div className="tree-children">
            {person.children!.map((child, index) => (
              <TreeNode key={index} person={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <div className="border-y border-rule bg-surface-sunken py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-center font-display text-4xl font-bold text-ink sm:text-5xl">
            {t.heading}
          </h1>
          <div className="divider-ornament my-5" aria-hidden="true" />
          <p className="mx-auto max-w-3xl text-center text-base text-ink-muted">
            {t.description}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 rounded-xl border border-rule bg-primary-subtle p-4">
          <p className="text-center text-sm text-primary sm:text-base">
            {t.instructions}
          </p>
        </div>

        {/* Tree Container */}
        <div
          ref={treeContainerRef}
          className="tree-container card-manuscript overflow-x-auto p-8"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="tree-wrapper">
            <div className="tree">
              <TreeNode person={conversionData} isRoot={true} />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-muted">
            {t.note}
          </p>
        </div>
      </div>

      <style>{`
        .tree-container {
          min-height: 600px;
          user-select: none;
        }

        .tree-wrapper {
          display: inline-block;
          min-width: 100%;
          padding: 40px 20px;
        }

        .tree {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .tree-node-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 10px;
        }

        .tree-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .arrow-container {
          margin: 12px 0;
          display: flex;
          justify-content: center;
        }

        .arrow-icon {
          color: var(--rule-strong);
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(5px);
          }
        }

        /* Node styling */
        .node-content {
          background: var(--surface);
          color: var(--ink);
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-card);
          min-width: 220px;
          max-width: 280px;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid var(--rule);
          border-top: 3px solid var(--accent);
        }

        .node-content:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lifted);
          border-color: var(--rule-strong);
          border-top-color: var(--accent);
        }

        /* Root node special styling */
        .root-node {
          background: var(--primary);
          color: #fff;
          min-width: 280px;
          max-width: 320px;
          padding: 24px 32px;
          border: 1px solid var(--primary-strong);
          border-top: 3px solid var(--accent);
          box-shadow: var(--shadow-lifted);
        }

        .root-node .name {
          font-size: 18px;
        }

        .name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .arabic-name {
          font-size: 15px;
          color: var(--accent);
          font-family: var(--font-arabic-stack);
          direction: rtl;
          unicode-bidi: isolate;
          margin-top: 6px;
        }

        .root-node .arabic-name {
          color: rgba(255, 255, 255, 0.85);
        }

        .tree-children {
          display: flex;
          gap: 30px;
          justify-content: center;
          flex-wrap: wrap;
          max-width: 1200px;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .tree-wrapper {
            padding: 30px 15px;
          }

          .tree-children {
            gap: 20px;
            flex-direction: column;
            align-items: center;
          }

          .node-content {
            min-width: 180px;
            max-width: 240px;
            padding: 14px 20px;
          }

          .root-node {
            min-width: 240px;
            max-width: 280px;
            padding: 20px 28px;
          }

          .root-node .name {
            font-size: 16px;
          }

          .name {
            font-size: 14px;
          }

          .arabic-name {
            font-size: 12px;
          }

          .arrow-icon {
            width: 20px;
            height: 20px;
          }
        }

        @media (max-width: 480px) {
          .node-content {
            min-width: 160px;
            max-width: 200px;
            padding: 12px 16px;
          }

          .root-node {
            min-width: 200px;
            max-width: 240px;
            padding: 18px 24px;
          }
        }
      `}</style>
    </div>
  );
}
