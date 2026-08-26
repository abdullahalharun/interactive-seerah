import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/translations/translations";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Move, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/components/ui/sheet";

type Lang = "en" | "bn";

interface Bilingual {
  en: string;
  bn: string;
}

interface RawPerson {
  id: string;
  name: Bilingual;
  arabicName?: string;
  role: Bilingual;
  year: Bilingual;
  bio: Bilingual;
  // How this person came to Islam: through whom, and how they learned of it.
  story: Bilingual;
  children?: RawPerson[];
}

// Positioned, flattened node ready for rendering.
interface LaidOutNode {
  id: string;
  parentId: string | null;
  depth: number;
  person: RawPerson;
  x: number;
  y: number;
}

const NODE_W = 240;
const NODE_H = 96;
const H_GAP = 40; // gap between sibling leaves
const V_GAP = 150; // vertical distance between levels
const CANVAS_PADDING = 400; // extra room around the layout so cards can be dragged out

// Conversion tree data — bilingual, with short life details for the drawer.
const treeData: RawPerson = {
  id: "muhammad",
  name: { en: "Prophet Muhammad (ﷺ)", bn: "মুহাম্মদ (সা.)" },
  arabicName: "محمد ﷺ",
  role: { en: "The Messenger of Allah", bn: "আল্লাহর রাসূল" },
  year: { en: "570–632 CE", bn: "৫৭০–৬৩২ খ্রি." },
  bio: {
    en: "Born in Makkah in the Year of the Elephant, he received the first revelation at age 40 in the cave of Hira. The root of this tree — every companion below embraced Islam through his invitation or through those he taught.",
    bn: "হস্তীবর্ষে মক্কায় জন্মগ্রহণ করেন এবং ৪০ বছর বয়সে হেরা গুহায় প্রথম ওহী লাভ করেন। এই বৃক্ষের মূল — নিচের প্রত্যেক সাহাবী তাঁর দাওয়াতে বা তাঁর শিক্ষায় ইসলাম গ্রহণ করেছেন।",
  },
  story: {
    en: "He did not learn Islam from any human being. At the age of 40, while in seclusion in the cave of Hira, the angel Jibril brought him the first revelation from Allah — “Read in the name of your Lord.” He is the source from whom every believer below received the message.",
    bn: "তিনি কোনো মানুষের কাছ থেকে ইসলাম শেখেননি। ৪০ বছর বয়সে হেরা গুহায় ধ্যানরত অবস্থায় জিবরাইল (আ.) আল্লাহর পক্ষ থেকে প্রথম ওহী আনেন — “পড়ুন আপনার রবের নামে।” নিচের প্রত্যেক বিশ্বাসী তাঁর কাছ থেকেই বার্তা পেয়েছেন।",
  },
  children: [
    {
      id: "khadijah",
      name: { en: "Khadijah bint Khuwaylid", bn: "খাদিজা বিনতে খুওয়াইলিদ" },
      arabicName: "خديجة بنت خويلد",
      role: { en: "First to accept Islam", bn: "প্রথম ইসলাম গ্রহণকারী" },
      year: { en: "c. 555–619 CE", bn: "আনু. ৫৫৫–৬১৯ খ্রি." },
      bio: {
        en: "The Prophet's first wife and the very first person to believe in his message. A noble and successful merchant of Makkah, she supported him with her wealth and unwavering faith.",
        bn: "নবীজির প্রথম স্ত্রী এবং তাঁর বার্তায় বিশ্বাসকারী সর্বপ্রথম ব্যক্তি। মক্কার এক সম্ভ্রান্ত ও সফল ব্যবসায়ী, যিনি তাঁর সম্পদ ও অবিচল ঈমান দিয়ে নবীজিকে সহায়তা করেন।",
      },
      story: {
        en: "As his wife, she witnessed his character up close for years. When he returned trembling from the cave of Hira, she comforted him and became the first person on earth to believe. Her cousin Waraqah confirmed that what came to him was the same revelation given to Moses.",
        bn: "স্ত্রী হিসেবে তিনি বছরের পর বছর নিকট থেকে নবীজির চরিত্র দেখেছেন। হেরা গুহা থেকে কাঁপতে কাঁপতে ফিরলে তিনি সান্ত্বনা দেন ও পৃথিবীর প্রথম বিশ্বাসী হন। তাঁর চাচাতো ভাই ওয়ারাকা নিশ্চিত করেন যে, তাঁর কাছে মুসা (আ.)-এর মতো ওহী এসেছে।",
      },
    },
    {
      id: "ali",
      name: { en: "Ali ibn Abi Talib", bn: "আলী ইবনে আবি তালিব" },
      arabicName: "علي بن أبي طالب",
      role: { en: "First young man to accept Islam", bn: "প্রথম যুবক ইসলাম গ্রহণকারী" },
      year: { en: "c. 600–661 CE", bn: "আনু. ৬০০–৬৬১ খ্রি." },
      bio: {
        en: "The Prophet's cousin, raised in his household. He accepted Islam as a boy of about ten and later became the fourth Rightly-Guided Caliph, renowned for knowledge and courage.",
        bn: "নবীজির চাচাতো ভাই, তাঁর গৃহে প্রতিপালিত। প্রায় দশ বছর বয়সে ইসলাম গ্রহণ করেন এবং পরে চতুর্থ খলিফা হন — জ্ঞান ও সাহসিকতার জন্য বিখ্যাত।",
      },
      story: {
        en: "Raised in the Prophet's own household, he saw him and Khadijah praying and asked about it. The Prophet invited him to worship the one God, and Ali — about ten years old — accepted after a night's thought, becoming the first child to embrace Islam.",
        bn: "নবীজির গৃহেই প্রতিপালিত হওয়ায় তিনি নবীজি ও খাদিজাকে নামাজে দেখে এ বিষয়ে জিজ্ঞাসা করেন। নবীজি তাঁকে এক আল্লাহর ইবাদতের দাওয়াত দেন, এবং প্রায় দশ বছর বয়সী আলী এক রাত ভেবে ইসলাম গ্রহণ করেন — প্রথম শিশু মুসলিম।",
      },
    },
    {
      id: "zaid",
      name: { en: "Zaid ibn Harithah", bn: "যায়েদ ইবনে হারিসা" },
      arabicName: "زيد بن حارثة",
      role: { en: "The beloved freed servant", bn: "প্রিয় মুক্ত দাস" },
      year: { en: "c. 581–629 CE", bn: "আনু. ৫৮১–৬২৯ খ্রি." },
      bio: {
        en: "Freed and adopted by the Prophet, he chose to stay with him over returning to his family. One of the earliest believers and a beloved commander who was martyred at Mu'tah.",
        bn: "নবীজি কর্তৃক মুক্ত ও পালিত; পরিবারে ফেরার বদলে নবীজির সঙ্গে থাকা বেছে নেন। প্রথম দিকের বিশ্বাসীদের একজন এবং মুতার যুদ্ধে শহীদ হওয়া প্রিয় সেনাপতি।",
      },
      story: {
        en: "Living in the Prophet's home as his freed and adopted son, he knew his truthfulness intimately. He believed early and completely, even choosing to remain with the Prophet over returning to his own father and family.",
        bn: "নবীজির মুক্ত ও পালিত পুত্র হিসেবে তাঁর গৃহে থেকে তিনি নবীজির সত্যবাদিতা গভীরভাবে জানতেন। তিনি আগেই ও পূর্ণভাবে বিশ্বাস আনেন, আপন পিতা-পরিবারে ফেরার বদলে নবীজির সঙ্গে থাকা বেছে নেন।",
      },
    },
    {
      id: "abubakr",
      name: { en: "Abu Bakr al-Siddiq", bn: "আবু বকর আল-সিদ্দিক" },
      arabicName: "أبو بكر الصديق",
      role: { en: "First free man to accept Islam", bn: "প্রথম স্বাধীন পুরুষ ইসলাম গ্রহণকারী" },
      year: { en: "573–634 CE", bn: "৫৭৩–৬৩৪ খ্রি." },
      bio: {
        en: "The Prophet's closest friend and companion in the Hijrah. His immediate belief earned him the title al-Siddiq (the Truthful). He personally invited many early Muslims and became the first Caliph.",
        bn: "নবীজির ঘনিষ্ঠতম বন্ধু ও হিজরতের সঙ্গী। তাঁর তাৎক্ষণিক বিশ্বাসের জন্য 'আস-সিদ্দিক' উপাধি লাভ করেন। বহু প্রাথমিক মুসলিমকে দাওয়াত দেন এবং প্রথম খলিফা হন।",
      },
      story: {
        en: "A close friend who knew the Prophet's honesty for years, he believed the moment he was told of the revelation, without hesitation — earning the title al-Siddiq. He then used his standing to invite many others to Islam.",
        bn: "বছরের পর বছর নবীজির সত্যবাদিতা জানা এই ঘনিষ্ঠ বন্ধু ওহীর কথা শুনেই বিনা দ্বিধায় বিশ্বাস আনেন — এজন্য “আস-সিদ্দিক” উপাধি পান। পরে নিজ প্রভাব কাজে লাগিয়ে অনেককে ইসলামের দাওয়াত দেন।",
      },
      children: [
        {
          id: "uthman",
          name: { en: "Uthman ibn Affan", bn: "উসমান ইবনে আফফান" },
          arabicName: "عثمان بن عفان",
          role: { en: "Invited by Abu Bakr", bn: "আবু বকরের দাওয়াতে" },
          year: { en: "c. 576–656 CE", bn: "আনু. ৫৭৬–৬৫৬ খ্রি." },
          bio: {
            en: "A wealthy and modest merchant who accepted Islam through Abu Bakr. Known as Dhun-Nurayn for marrying two of the Prophet's daughters, he became the third Caliph and compiled the Qur'an into one standard text.",
            bn: "একজন ধনী ও বিনয়ী ব্যবসায়ী, যিনি আবু বকরের মাধ্যমে ইসলাম গ্রহণ করেন। নবীজির দুই কন্যাকে বিবাহ করায় 'যুন-নূরাইন' নামে পরিচিত; তৃতীয় খলিফা এবং কুরআন সংকলনকারী।",
          },
          story: {
            en: "Abu Bakr, his friend, spoke to him about Islam and brought him to the Prophet. Reassured by the Prophet's words, this modest young merchant accepted the faith among the very first.",
            bn: "তাঁর বন্ধু আবু বকর তাঁকে ইসলামের কথা বলেন ও নবীজির কাছে নিয়ে আসেন। নবীজির কথায় আশ্বস্ত হয়ে এই বিনয়ী তরুণ ব্যবসায়ী সর্বপ্রথমদের মধ্যে ইসলাম গ্রহণ করেন।",
          },
        },
        {
          id: "abdurrahman",
          name: { en: "Abdur Rahman ibn Auf", bn: "আবদুর রহমান ইবনে আউফ" },
          arabicName: "عبد الرحمن بن عوف",
          role: { en: "Invited by Abu Bakr", bn: "আবু বকরের দাওয়াতে" },
          year: { en: "c. 581–652 CE", bn: "আনু. ৫৮১–৬৫২ খ্রি." },
          bio: {
            en: "One of the ten promised Paradise. A gifted trader who gave enormously in charity, he embraced Islam among the earliest through Abu Bakr's invitation.",
            bn: "জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন। একজন দক্ষ ব্যবসায়ী যিনি প্রচুর দান করতেন; আবু বকরের দাওয়াতে সর্বপ্রথমদের মধ্যে ইসলাম গ্রহণ করেন।",
          },
          story: {
            en: "He was among the group of early companions whom Abu Bakr personally invited to Islam. He responded at once and became one of the ten given glad tidings of Paradise.",
            bn: "আবু বকর যাদের ব্যক্তিগতভাবে ইসলামের দাওয়াত দেন, তিনি সেই প্রাথমিক সাহাবীদের একজন। সঙ্গে সঙ্গে সাড়া দেন ও জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন হন।",
          },
        },
        {
          id: "saad",
          name: { en: "Sa'd ibn Abi Waqqas", bn: "সা'দ ইবনে আবি ওয়াক্কাস" },
          arabicName: "سعد بن أبي وقاص",
          role: { en: "Invited by Abu Bakr", bn: "আবু বকরের দাওয়াতে" },
          year: { en: "c. 595–674 CE", bn: "আনু. ৫৯৫–৬৭৪ খ্রি." },
          bio: {
            en: "The first to shoot an arrow in defence of Islam and a great commander who led the conquest of Persia. He accepted Islam at seventeen through Abu Bakr.",
            bn: "ইসলামের প্রতিরক্ষায় প্রথম তীর নিক্ষেপকারী এবং পারস্য বিজয়ের নেতৃত্বদানকারী মহান সেনাপতি। সতেরো বছর বয়সে আবু বকরের মাধ্যমে ইসলাম গ্রহণ করেন।",
          },
          story: {
            en: "At seventeen, he was invited to Islam by Abu Bakr and accepted without delay. He was proud to be among the earliest and dearly loved the Prophet.",
            bn: "সতেরো বছর বয়সে আবু বকরের দাওয়াতে তিনি বিলম্ব না করে ইসলাম গ্রহণ করেন। প্রথমদের মধ্যে থাকায় গর্বিত ছিলেন ও নবীজিকে গভীরভাবে ভালোবাসতেন।",
          },
        },
        {
          id: "talha",
          name: { en: "Talha ibn Ubaydullah", bn: "তালহা ইবনে উবাইদুল্লাহ" },
          arabicName: "طلحة بن عبيد الله",
          role: { en: "Invited by Abu Bakr", bn: "আবু বকরের দাওয়াতে" },
          year: { en: "c. 594–656 CE", bn: "আনু. ৫৯৪–৬৫৬ খ্রি." },
          bio: {
            en: "One of the ten promised Paradise. He shielded the Prophet with his own body at Uhud, losing the use of a hand. He too came to Islam through Abu Bakr.",
            bn: "জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন। উহুদের দিন নিজ দেহ দিয়ে নবীজিকে রক্ষা করেন ও একটি হাত অচল হয়ে যায়। তিনিও আবু বকরের মাধ্যমে ইসলাম গ্রহণ করেন।",
          },
          story: {
            en: "A young merchant, he heard of the Prophet on a trade journey to Syria where a monk foretold a prophet's coming. Back in Makkah, Abu Bakr guided him to Islam.",
            bn: "এক তরুণ ব্যবসায়ী, সিরিয়ায় বাণিজ্যযাত্রায় এক পাদ্রীর কাছে এক নবীর আগমনের খবর শোনেন। মক্কায় ফিরে আবু বকর তাঁকে ইসলামের পথ দেখান।",
          },
        },
        {
          id: "zubair",
          name: { en: "Zubair ibn al-Awwam", bn: "যুবাইর ইবনুল আউয়াম" },
          arabicName: "الزبير بن العوام",
          role: { en: "Invited by Abu Bakr", bn: "আবু বকরের দাওয়াতে" },
          year: { en: "c. 594–656 CE", bn: "আনু. ৫৯৪–৬৫৬ খ্রি." },
          bio: {
            en: "The Prophet's cousin and the first to draw a sword for Islam. One of the ten promised Paradise, he accepted Islam at fifteen through Abu Bakr.",
            bn: "নবীজির চাচাতো ভাই এবং ইসলামের পক্ষে প্রথম তরবারি উত্তোলনকারী। জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন; পনেরো বছর বয়সে আবু বকরের মাধ্যমে ইসলাম গ্রহণ করেন।",
          },
          story: {
            en: "Only fifteen, he accepted Islam through Abu Bakr's invitation among the earliest believers, and was the first ever to draw a sword in defence of the faith.",
            bn: "মাত্র পনেরো বছর বয়সে আবু বকরের দাওয়াতে প্রথম বিশ্বাসীদের মধ্যে ইসলাম গ্রহণ করেন, এবং ইসলামের প্রতিরক্ষায় সর্বপ্রথম তরবারি উত্তোলন করেন।",
          },
        },
      ],
    },
    {
      id: "bilal",
      name: { en: "Bilal ibn Rabah", bn: "বিলাল ইবনে রাবাহ" },
      arabicName: "بلال بن رباح",
      role: { en: "The first muezzin", bn: "প্রথম মুয়াজ্জিন" },
      year: { en: "c. 580–640 CE", bn: "আনু. ৫৮০–৬৪০ খ্রি." },
      bio: {
        en: "An Abyssinian slave tortured for his faith, who cried \"Ahad, Ahad\" (One, One). Freed by Abu Bakr, he became the Prophet's first caller to prayer.",
        bn: "ঈমানের জন্য নির্যাতিত এক আবিসিনীয় দাস, যিনি 'আহাদ, আহাদ' (এক, এক) বলতেন। আবু বকর তাঁকে মুক্ত করেন এবং তিনি নবীজির প্রথম মুয়াজ্জিন হন।",
      },
      story: {
        en: "A slave in Makkah, he heard the message and believed, then endured burning sand and stones on his chest while crying “Ahad, Ahad.” Abu Bakr bought and freed him for the sake of his faith.",
        bn: "মক্কার এক দাস, বার্তা শুনে বিশ্বাস আনেন; তপ্ত বালু ও বুকে পাথর চাপার যন্ত্রণাসহেও “আহাদ, আহাদ” বলতেন। আবু বকর তাঁকে কিনে মুক্ত করে দেন।",
      },
    },
    {
      id: "ammar",
      name: { en: "Ammar ibn Yasir", bn: "আম্মার ইবনে ইয়াসির" },
      arabicName: "عمار بن ياسر",
      role: { en: "From an early martyred family", bn: "প্রথম শহীদ পরিবার থেকে" },
      year: { en: "c. 570–657 CE", bn: "আনু. ৫৭০–৬৫৭ খ্রি." },
      bio: {
        en: "Among the earliest and most persecuted Muslims. His parents, Yasir and Sumayyah, were the first martyrs of Islam. He remained steadfast throughout his long life.",
        bn: "প্রথম দিকের ও সর্বাধিক নির্যাতিত মুসলিমদের একজন। তাঁর পিতা-মাতা ইয়াসির ও সুমাইয়া ছিলেন ইসলামের প্রথম শহীদ। দীর্ঘ জীবনজুড়ে তিনি অবিচল ছিলেন।",
      },
      story: {
        en: "He and his family were among the first to believe in Makkah. Together with his parents Yasir and Sumayyah he embraced Islam early and endured brutal torture for it.",
        bn: "তিনি ও তাঁর পরিবার মক্কায় প্রথম বিশ্বাসীদের মধ্যে ছিলেন। পিতা-মাতা ইয়াসির ও সুমাইয়ার সঙ্গে আগেই ইসলাম গ্রহণ করে নিষ্ঠুর নির্যাতন সহ্য করেন।",
      },
    },
    {
      id: "umar",
      name: { en: "Umar ibn al-Khattab", bn: "উমর ইবনুল খাত্তাব" },
      arabicName: "عمر بن الخطاب",
      role: { en: "The mighty second Caliph", bn: "প্রতাপশালী দ্বিতীয় খলিফা" },
      year: { en: "c. 584–644 CE", bn: "আনু. ৫৮৪–৬৪৪ খ্রি." },
      bio: {
        en: "Once a fierce opponent, he set out to kill the Prophet but was transformed on reading the Qur'an. His conversion strengthened the Muslims greatly; he became the second Caliph.",
        bn: "একসময় কট্টর বিরোধী, নবীজিকে হত্যা করতে বেরিয়ে কুরআন পড়ে পরিবর্তিত হন। তাঁর ইসলাম গ্রহণ মুসলিমদের ব্যাপকভাবে শক্তিশালী করে; তিনি দ্বিতীয় খলিফা হন।",
      },
      story: {
        en: "Enraged, he set out to kill the Prophet. Told that his own sister had become Muslim, he stormed to her house, but on hearing the Qur'an being recited there his heart melted. He went straight to the Prophet and declared his faith.",
        bn: "ক্রোধান্বিত হয়ে তিনি নবীজিকে হত্যা করতে বের হন। নিজ বোন মুসলিম হয়েছে শুনে তার ঘরে যান, কিন্তু সেখানে কুরআন তিলাওয়াত শুনে তাঁর হৃদয় গলে যায়। সরাসরি নবীজির কাছে গিয়ে ইসলাম গ্রহণ করেন।",
      },
      children: [
        {
          id: "saidzaid",
          name: { en: "Sa'id ibn Zaid", bn: "সাঈদ ইবনে যায়েদ" },
          arabicName: "سعيد بن زيد",
          role: { en: "Umar's brother-in-law", bn: "উমরের ভগ্নিপতি" },
          year: { en: "c. 593–671 CE", bn: "আনু. ৫৯৩–৬৭১ খ্রি." },
          bio: {
            en: "One of the ten promised Paradise. It was in his home, as his wife Fatimah (Umar's sister) recited the Qur'an, that Umar's heart softened toward Islam.",
            bn: "জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন। তাঁর গৃহে তাঁর স্ত্রী ফাতিমা (উমরের বোন) কুরআন তিলাওয়াত করছিলেন — সেখানেই উমরের হৃদয় ইসলামের প্রতি নরম হয়।",
          },
          story: {
            en: "He and his wife Fatimah (Umar's sister) had already accepted Islam secretly. It was in his home, hearing Fatimah recite the Qur'an, that Umar's own heart was softened toward Islam.",
            bn: "তিনি ও তাঁর স্ত্রী ফাতিমা (উমরের বোন) আগেই গোপনে ইসলাম গ্রহণ করেছিলেন। তাঁর ঘরেই ফাতিমার কুরআন তিলাওয়াত শুনে উমরের হৃদয় ইসলামের প্রতি নরম হয়।",
          },
        },
      ],
    },
    {
      id: "hamza",
      name: { en: "Hamza ibn Abdul-Muttalib", bn: "হামযা ইবনে আবদুল মুত্তালিব" },
      arabicName: "حمزة بن عبد المطلب",
      role: { en: "Lion of Allah", bn: "আল্লাহর সিংহ" },
      year: { en: "c. 568–625 CE", bn: "আনু. ৫৬৮–৬২৫ খ্রি." },
      bio: {
        en: "The Prophet's uncle and foster brother. A renowned warrior, he embraced Islam in defence of his nephew and was martyred at Uhud, earning the title Lion of Allah.",
        bn: "নবীজির চাচা ও দুধভাই। একজন খ্যাতনামা যোদ্ধা, ভাতিজার প্রতিরক্ষায় ইসলাম গ্রহণ করেন এবং উহুদে শহীদ হয়ে 'আল্লাহর সিংহ' উপাধি লাভ করেন।",
      },
      story: {
        en: "Returning from a hunt, he heard that Abu Jahl had insulted his nephew the Prophet. In anger and loyalty he struck Abu Jahl and declared himself a Muslim — and his faith soon became firm and sincere.",
        bn: "শিকার থেকে ফিরে শুনেন আবু জাহল তাঁর ভাতিজা নবীজিকে অপমান করেছে। ক্রোধ ও আনুগত্যে তিনি আবু জাহলকে আঘাত করে নিজেকে মুসলিম ঘোষণা করেন — পরে তাঁর ঈমান দৃঢ় ও আন্তরিক হয়।",
      },
    },
    {
      id: "jafar",
      name: { en: "Ja'far ibn Abi Talib", bn: "জাফর ইবনে আবি তালিব" },
      arabicName: "جعفر بن أبي طالب",
      role: { en: "Leader of the Abyssinia migration", bn: "আবিসিনিয়া হিজরতের নেতা" },
      year: { en: "c. 590–629 CE", bn: "আনু. ৫৯০–৬২৯ খ্রি." },
      bio: {
        en: "Ali's elder brother, who led the migration to Abyssinia and spoke eloquently before the Negus. He was martyred at Mu'tah and called Dhul-Janahayn (the two-winged).",
        bn: "আলীর বড় ভাই, যিনি আবিসিনিয়ায় হিজরতের নেতৃত্ব দেন ও নাজ্জাশির সামনে বলিষ্ঠ ভাষণ দেন। মুতায় শহীদ হন এবং 'যুল-জানাহাইন' (দুই ডানাওয়ালা) নামে পরিচিত।",
      },
      story: {
        en: "One of the early believers in Makkah, he accepted Islam young. Later he led the migrants in Abyssinia and recited the Qur'an about Jesus and Mary before the Christian king, the Negus.",
        bn: "মক্কার প্রাথমিক বিশ্বাসীদের একজন, যুবক বয়সে ইসলাম গ্রহণ করেন। পরে আবিসিনিয়ায় হিজরতকারীদের নেতৃত্ব দেন ও খ্রিষ্টান রাজা নাজ্জাশির সামনে ঈসা ও মরিয়ম সম্পর্কে কুরআন তিলাওয়াত করেন।",
      },
      children: [
        {
          id: "asma",
          name: { en: "Asma bint Umays", bn: "আসমা বিনতে উমাইস" },
          arabicName: "أسماء بنت عميس",
          role: { en: "Ja'far's wife", bn: "জাফরের স্ত্রী" },
          year: { en: "d. c. 660 CE", bn: "মৃ. আনু. ৬৬০ খ্রি." },
          bio: {
            en: "An early believer who migrated with her husband Ja'far to Abyssinia and later to Madinah. A learned narrator of hadith, close to the Prophet's household.",
            bn: "একজন প্রাথমিক বিশ্বাসী, স্বামী জাফরের সঙ্গে আবিসিনিয়া ও পরে মদিনায় হিজরত করেন। হাদিসের একজন বিদুষী বর্ণনাকারী, নবী-পরিবারের ঘনিষ্ঠ।",
          },
          story: {
            en: "An early believer, she accepted Islam alongside her husband Ja'far and migrated with him to Abyssinia, enduring exile for the sake of the faith.",
            bn: "একজন প্রাথমিক বিশ্বাসী, স্বামী জাফরের সঙ্গে ইসলাম গ্রহণ করে আবিসিনিয়ায় হিজরত করেন ও ঈমানের জন্য নির্বাসন সহ্য করেন।",
          },
        },
      ],
    },
    {
      id: "abuubaidah",
      name: { en: "Abu Ubaidah ibn al-Jarrah", bn: "আবু উবাইদা ইবনুল জাররাহ" },
      arabicName: "أبو عبيدة بن الجراح",
      role: { en: "Trustee of the Ummah", bn: "উম্মাহর আমীন" },
      year: { en: "c. 583–639 CE", bn: "আনু. ৫৮৩–৬৩৯ খ্রি." },
      bio: {
        en: "One of the ten promised Paradise, called the Trustee of this Ummah by the Prophet. An early Muslim and brilliant general who commanded the armies in Syria.",
        bn: "জান্নাতের সুসংবাদপ্রাপ্ত দশজনের একজন, নবীজি যাঁকে 'এই উম্মাহর আমীন' বলেছেন। একজন প্রাথমিক মুসলিম ও দক্ষ সেনাপতি, সিরিয়ায় সেনাবাহিনীর নেতৃত্ব দেন।",
      },
      story: {
        en: "Among the earliest to embrace Islam, he accepted the faith in its first days in Makkah through the circle of Abu Bakr's companions, and never wavered despite the persecution.",
        bn: "সর্বপ্রথম ইসলাম গ্রহণকারীদের একজন, মক্কার প্রথম দিনগুলোতে আবু বকরের সাথীদের মাধ্যমে ইসলাম গ্রহণ করেন ও নির্যাতনেও অবিচল থাকেন।",
      },
    },
    {
      id: "musab",
      name: { en: "Mus'ab ibn Umayr", bn: "মুসআব ইবনে উমাইর" },
      arabicName: "مصعب بن عمير",
      role: { en: "First teacher of Madinah", bn: "মদিনার প্রথম শিক্ষক" },
      year: { en: "c. 594–625 CE", bn: "আনু. ৫৯৪–৬২৫ খ্রি." },
      bio: {
        en: "A pampered young noble who gave up luxury for Islam. Sent as the first envoy to Madinah, he taught the Qur'an there and was martyred at Uhud carrying the banner.",
        bn: "এক বিলাসী তরুণ অভিজাত, যিনি ইসলামের জন্য আরাম ত্যাগ করেন। মদিনায় প্রথম দূত হিসেবে প্রেরিত হয়ে কুরআন শেখান এবং উহুদে পতাকা বহন করতে গিয়ে শহীদ হন।",
      },
      story: {
        en: "A luxury-loving young noble, he was drawn to the Prophet's message in Makkah and secretly became Muslim. When his family discovered it they imprisoned him, but he stood firm and gave up everything for his faith.",
        bn: "বিলাসপ্রিয় এক তরুণ অভিজাত, মক্কায় নবীজির বার্তায় আকর্ষিত হয়ে গোপনে মুসলিম হন। পরিবার জানতে পেরে তাঁকে বন্দি করলেও তিনি অটল থাকেন ও ঈমানের জন্য সব ত্যাগ করেন।",
      },
      children: [
        {
          id: "asad",
          name: { en: "As'ad ibn Zurarah", bn: "আসআদ ইবনে যুরারা" },
          arabicName: "أسعد بن زرارة",
          role: { en: "Host of Mus'ab in Madinah", bn: "মদিনায় মুসআবের মেজবান" },
          year: { en: "d. c. 623 CE", bn: "মৃ. আনু. ৬২৩ খ্রি." },
          bio: {
            en: "An early Ansari believer who invited Mus'ab into his home and helped spread Islam across Madinah. He led one of the first congregational prayers there.",
            bn: "একজন প্রাথমিক আনসারি বিশ্বাসী, যিনি মুসআবকে নিজ গৃহে আমন্ত্রণ জানান ও মদিনায় ইসলাম প্রচারে সহায়তা করেন। সেখানে প্রথম জামাতের নামাজগুলোর একটির নেতৃত্ব দেন।",
          },
          story: {
            en: "An Ansari who met Mus'ab when he came to teach in Madinah. He welcomed Mus'ab into his home, learned the Qur'an from him, and became one of the first Muslims of the city.",
            bn: "একজন আনসারি, মুসআব মদিনায় শিক্ষা দিতে এলে তাঁর সঙ্গে সাক্ষাত হয়। মুসআবকে ঘরে স্বাগত জানান, তাঁর কাছ থেকে কুরআন শেখেন ও শহরের প্রথম মুসলিমদের একজন হন।",
          },
        },
        {
          id: "usayd",
          name: { en: "Usayd ibn Hudayr", bn: "উসাইদ ইবনে হুদাইর" },
          arabicName: "أسيد بن حضير",
          role: { en: "Chief of the Ansar", bn: "আনসারদের নেতা" },
          year: { en: "d. c. 641 CE", bn: "মৃ. আনু. ৬৪১ খ্রি." },
          bio: {
            en: "A respected leader of Madinah who came to confront Mus'ab but was moved by the Qur'an and embraced Islam, drawing many of his people with him.",
            bn: "মদিনার একজন সম্মানিত নেতা, যিনি মুসআবের মুখোমুখি হতে এসেছিলেন কিন্তু কুরআনে বিমোহিত হয়ে ইসলাম গ্রহণ করেন এবং তাঁর বহু লোককে সঙ্গে নিয়ে আসেন।",
          },
          story: {
            en: "A chief of Madinah, he came armed to stop Mus'ab from preaching. But Mus'ab calmly invited him to listen; hearing the Qur'an, he was overwhelmed and embraced Islam on the spot.",
            bn: "মদিনার এক নেতা, মুসআবের প্রচার থামাতে সশস্ত্র এসেছিলেন। কিন্তু মুসআব শান্তভাবে তাঁকে শোনার আহ্বান জানান; কুরআন শুনে বিমোহিত হয়ে তাৎক্ষণাৎ ইসলাম গ্রহণ করেন।",
          },
        },
        {
          id: "saadmuadh",
          name: { en: "Sa'd ibn Mu'adh", bn: "সা'দ ইবনে মু'আয" },
          arabicName: "سعد بن معاذ",
          role: { en: "Leader of Banu Abd al-Ashhal", bn: "বনু আবদুল আশহালের নেতা" },
          year: { en: "c. 591–627 CE", bn: "আনু. ৫৯১–৬২৭ খ্রি." },
          bio: {
            en: "One of Madinah's foremost chiefs. His acceptance brought his entire clan, Banu Abd al-Ashhal, to Islam in a single day. He was gravely wounded at the Battle of the Trench.",
            bn: "মদিনার অন্যতম প্রধান নেতা। তাঁর ইসলাম গ্রহণে তাঁর সমগ্র গোত্র বনু আবদুল আশহাল একদিনেই ইসলাম গ্রহণ করে। খন্দকের যুদ্ধে তিনি গুরুতর আহত হন।",
          },
          story: {
            en: "Sent by Usayd, this great chief also went to challenge Mus'ab. Mus'ab's gentle words and the Qur'an won his heart. His acceptance brought his whole clan, Banu Abd al-Ashhal, to Islam that same day.",
            bn: "উসাইদের প্রেরণায় এই মহান নেতাও মুসআবকে চ্যালেঞ্জ করতে যান। মুসআবের কোমল কথা ও কুরআন তাঁর হৃদয় জয় করে। তাঁর ইসলাম গ্রহণে সেই দিনই তাঁর সমগ্র গোত্র বনু আবদুল আশহাল ইসলাম গ্রহণ করে।",
          },
          children: [
            {
              id: "amrmuadh",
              name: { en: "Amr ibn Mu'adh", bn: "আমর ইবনে মু'আয" },
              arabicName: "عمرو بن معاذ",
              role: { en: "Sa'd's brother", bn: "সা'দের ভাই" },
              year: { en: "d. 627 CE", bn: "মৃ. ৬২৭ খ্রি." },
              bio: {
                en: "Brother of Sa'd ibn Mu'adh, he embraced Islam alongside his clan when Sa'd did. A devoted Ansari who was martyred at the Battle of the Trench.",
                bn: "সা'দ ইবনে মু'আযের ভাই, সা'দের সঙ্গে তাঁর গোত্রের সাথে ইসলাম গ্রহণ করেন। একজন নিবেদিত আনসারি, খন্দকের যুদ্ধে শহীদ হন।",
              },
              story: {
                en: "When his brother Sa'd ibn Mu'adh accepted Islam and called their clan to the faith, he answered at once, embracing Islam along with Banu Abd al-Ashhal.",
                bn: "তাঁর ভাই সা’দ ইবনে মু’ায ইসলাম গ্রহণ করে গোত্রকে ঈমানের ডাক দিলে তিনি সঙ্গে সঙ্গে সাড়া দিয়ে বনু আবদুল আশহালের সঙ্গে ইসলাম গ্রহণ করেন।",
              },
            },
          ],
        },
      ],
    },
    {
      id: "ibnmasud",
      name: { en: "Abdullah ibn Mas'ud", bn: "আবদুল্লাহ ইবনে মাসউদ" },
      arabicName: "عبد الله بن مسعود",
      role: { en: "Master of the Qur'an", bn: "কুরআনের পণ্ডিত" },
      year: { en: "c. 594–653 CE", bn: "আনু. ৫৯৪–৬৫৩ খ্রি." },
      bio: {
        en: "The sixth person to accept Islam and the first to recite the Qur'an aloud publicly in Makkah. A close servant of the Prophet and one of the greatest scholars of the Qur'an.",
        bn: "ষষ্ঠ ব্যক্তি হিসেবে ইসলাম গ্রহণ করেন এবং মক্কায় প্রকাশ্যে উচ্চস্বরে কুরআন তিলাওয়াতকারী প্রথম ব্যক্তি। নবীজির ঘনিষ্ঠ খাদেম ও কুরআনের অন্যতম শ্রেষ্ঠ পণ্ডিত।",
      },
      story: {
        en: "A poor shepherd boy, he witnessed a miracle when the Prophet drew milk from a barren goat. Amazed, he asked to be taught, and became the sixth person to accept Islam.",
        bn: "এক গরিব রাখাল বালক, নবীজি একটি দুগ্ধহীন ছাগল থেকে দুধ বের করার মু’জিজা প্রত্যক্ষ করেন। বিস্মিত হয়ে শিক্ষা চান ও ষষ্ঠ ব্যক্তি হিসেবে ইসলাম গ্রহণ করেন।",
      },
    },
    {
      id: "abudharr",
      name: { en: "Abu Dharr al-Ghifari", bn: "আবু যর আল-গিফারি" },
      arabicName: "أبو ذر الغفاري",
      role: { en: "Early truth-seeker", bn: "প্রথম সত্যান্বেষী" },
      year: { en: "d. c. 652 CE", bn: "মৃ. আনু. ৬৫২ খ্রি." },
      bio: {
        en: "A seeker of truth from the Ghifar tribe who rejected idols before Islam. Among the first to accept the faith, he then returned to guide his own people to Islam.",
        bn: "গিফার গোত্রের এক সত্যান্বেষী, যিনি ইসলামের আগেই মূর্তি প্রত্যাখ্যান করেছিলেন। প্রথম ইসলাম গ্রহণকারীদের একজন, পরে নিজ গোত্রকে ইসলামের পথে ফিরিয়ে আনেন।",
      },
      story: {
        en: "A truth-seeker who had already rejected idols, he heard rumours of a prophet in Makkah and sent his brother to investigate. Unsatisfied, he went himself, met the Prophet, and immediately declared his faith openly.",
        bn: "এক সত্যান্বেষী, যিনি আগেই মূর্তি প্রত্যাখ্যান করেছিলেন, মক্কায় এক নবীর গুঞ্জন শুনে ভাইকে খোঁজ নিতে পাঠান। সন্তুষ্ট না হয়ে নিজে গিয়ে নবীজির সঙ্গে দেখা করেন ও সঙ্গে সঙ্গে প্রকাশ্যে ঈমান ঘোষণা করেন।",
      },
      children: [
        {
          id: "unays",
          name: { en: "Unays ibn Junadah", bn: "উনাইস ইবনে জুনাদা" },
          arabicName: "أنيس بن جنادة",
          role: { en: "Abu Dharr's brother", bn: "আবু যরের ভাই" },
          year: { en: "7th century CE", bn: "৭ম শতাব্দী খ্রি." },
          bio: {
            en: "The brother of Abu Dharr, a poet who first brought back news of the Prophet. He accepted Islam through his brother and helped call the Ghifar tribe to faith.",
            bn: "আবু যরের ভাই, একজন কবি, যিনি প্রথম নবীজির খবর নিয়ে আসেন। ভাইয়ের মাধ্যমে ইসলাম গ্রহণ করেন ও গিফার গোত্রকে ঈমানের দাওয়াত দিতে সহায়তা করেন।",
          },
          story: {
            en: "Sent by his brother Abu Dharr to learn about the Prophet, he met him and returned convinced. Through his brother's guidance he accepted Islam and helped call the Ghifar tribe to the faith.",
            bn: "ভাই আবু যরের প্রেরণায় নবীজি সম্পর্কে জানতে গিয়ে তাঁর সঙ্গে দেখা করেন ও নিশ্চিত হয়ে ফেরেন। ভাইয়ের পথনির্দেশনায় ইসলাম গ্রহণ করে গিফার গোত্রকে দাওয়াত দেন।",
          },
        },
      ],
    },
    {
      id: "salman",
      name: { en: "Salman al-Farisi", bn: "সালমান আল-ফারসি" },
      arabicName: "سلمان الفارسي",
      role: { en: "The Persian seeker", bn: "পারস্যের অন্বেষক" },
      year: { en: "d. c. 656 CE", bn: "মৃ. আনু. ৬৫৬ খ্রি." },
      bio: {
        en: "Born in Persia, he journeyed through many lands seeking the true faith until he found the Prophet in Madinah. He proposed the strategy of the trench that saved the city.",
        bn: "পারস্যে জন্ম, প্রকৃত ধর্মের সন্ধানে বহু দেশ ঘুরে অবশেষে মদিনায় নবীজিকে খুঁজে পান। তিনিই খন্দক (পরিখা) খননের কৌশল প্রস্তাব করেন যা মদিনাকে রক্ষা করে।",
      },
      story: {
        en: "Born a Persian, he left his home religion and searched through Christian monks across many lands, each pointing him onward. The last foretold a prophet in Arabia. He journeyed there, was sold into slavery, and finally met the Prophet in Madinah, recognising the signs he had been told of.",
        bn: "পারস্যে জন্ম, নিজ ধর্ম ছেড়ে বহু দেশে খ্রিষ্টান সন্ন্যাসীদের কাছে সত্য খুঁজেছেন। শেষজন আরবে এক নবীর আগমনের সংবাদ দেন। সেখানে যাওয়ার পথে দাস হন, অবশেষে মদিনায় নবীজিকে পেয়ে বর্ণিত নিদর্শনগুলো দেখে ইসলাম গ্রহণ করেন।",
      },
    },
    {
      id: "khabbab",
      name: { en: "Khabbab ibn al-Aratt", bn: "খাব্বাব ইবনুল আরাত" },
      arabicName: "خباب بن الأرت",
      role: { en: "Among the first, sorely tortured", bn: "প্রথমদের একজন, কঠোর নির্যাতিত" },
      year: { en: "d. c. 657 CE", bn: "মৃ. আনু. ৬৫৭ খ্রি." },
      bio: {
        en: "A blacksmith and one of the first to openly declare Islam. He endured severe torture yet never wavered, and taught the Qur'an to early Muslims like Umar's sister.",
        bn: "একজন কামার এবং প্রকাশ্যে ইসলাম ঘোষণাকারী প্রথমদের একজন। কঠোর নির্যাতন সহ্য করেও অবিচল থাকেন এবং উমরের বোনের মতো প্রাথমিক মুসলিমদের কুরআন শেখান।",
      },
      story: {
        en: "A blacksmith and one of the first six or seven to declare Islam openly in Makkah. He learned directly in the earliest days and bore savage torture, yet later taught the Qur'an to others, including Umar's sister.",
        bn: "এক কামার, মক্কায় প্রকাশ্যে ইসলাম ঘোষণাকারী প্রথম ছয়-সাতজনের একজন। প্রথম দিনগুলোতেই শিক্ষা নেন ও ভয়ংকর নির্যাতন সহ্য করেন; পরে উমরের বোনসহ অনেককে কুরআন শেখান।",
      },
    },
    {
      id: "suhaib",
      name: { en: "Suhaib al-Rumi", bn: "সুহাইব আর-রুমি" },
      arabicName: "صهيب الرومي",
      role: { en: "The one who traded all for faith", bn: "যিনি ঈমানের জন্য সব দিয়েছেন" },
      year: { en: "c. 587–659 CE", bn: "আনু. ৫৮৭–৬৫৯ খ্রি." },
      bio: {
        en: "Raised in Byzantine lands, he became a prosperous Makkan merchant. When migrating, he gave up all his wealth to the Quraysh in exchange for his freedom to reach the Prophet.",
        bn: "বাইজেন্টাইন ভূমিতে প্রতিপালিত, পরে মক্কার এক সমৃদ্ধ ব্যবসায়ী হন। হিজরতের সময় নবীজির কাছে পৌঁছানোর স্বাধীনতার বিনিময়ে কুরাইশদের নিজের সব সম্পদ দিয়ে দেন।",
      },
      story: {
        en: "An early Muslim in Makkah, he embraced the faith around the same time as Ammar ibn Yasir. When he migrated, the Quraysh let him leave only after he handed over all his wealth — a trade the Prophet called profitable.",
        bn: "মক্কায় এক প্রাথমিক মুসলিম, আম্মার ইবনে ইয়াসিরের প্রায় একই সময়ে ঈমান আনেন। হিজরতকালে কুরাইশরা তাঁর সমস্ত সম্পদ নিয়ে তবেই যেতে দেয় — নবীজি যাকে লাভজনক বাণিজ্য বলেন।",
      },
    },
    {
      id: "anas",
      name: { en: "Anas ibn Malik", bn: "আনাস ইবনে মালিক" },
      arabicName: "أنس بن مالك",
      role: { en: "Servant of the Prophet (ﷺ)", bn: "নবীজি (সা.)-এর খাদেম" },
      year: { en: "c. 612–712 CE", bn: "আনু. ৬১২–৭১২ খ্রি." },
      bio: {
        en: "Given by his mother to serve the Prophet as a young boy in Madinah. He served for ten years and became one of the most prolific narrators of hadith.",
        bn: "শৈশবে মদিনায় মায়ের পক্ষ থেকে নবীজির সেবায় নিয়োজিত হন। দশ বছর সেবা করেন এবং হাদিসের অন্যতম প্রধান বর্ণনাকারী হন।",
      },
      story: {
        en: "When the Prophet migrated to Madinah, his mother Umm Sulaym brought him — a boy of about ten — to serve the Prophet. Growing up in that household, he embraced Islam naturally and served faithfully for ten years.",
        bn: "নবীজি মদিনায় হিজরত করলে তাঁর মা উম্মু সুলাইম প্রায় দশ বছর বয়সী তাঁকে নবীজির সেবায় দেন। সেই গৃহে বেড়ে উঠে স্বাভাবিকভাবেই ইসলাম গ্রহণ করে দশ বছর বিশ্বস্ততার সঙ্গে সেবা করেন।",
      },
    },
    {
      id: "khalid",
      name: { en: "Khalid ibn al-Walid", bn: "খালিদ ইবনুল ওয়ালিদ" },
      arabicName: "خالد بن الوليد",
      role: { en: "The Sword of Allah", bn: "আল্লাহর তরবারি" },
      year: { en: "c. 585–642 CE", bn: "আনু. ৫৮৫–৬৪২ খ্রি." },
      bio: {
        en: "A brilliant Qurayshi general who fought against the Muslims before embracing Islam after Hudaybiyyah. Undefeated in battle, the Prophet named him the Sword of Allah.",
        bn: "একজন প্রতিভাবান কুরাইশ সেনাপতি, হুদায়বিয়ার পর ইসলাম গ্রহণের আগে মুসলিমদের বিরুদ্ধে লড়েছিলেন। যুদ্ধে অপরাজিত; নবীজি তাঁকে 'আল্লাহর তরবারি' নাম দেন।",
      },
      story: {
        en: "A brilliant general who had fought against the Muslims at Uhud, he reflected after the treaty of Hudaybiyyah that Islam was clearly triumphing. He travelled to Madinah of his own will and gave his pledge to the Prophet.",
        bn: "এক প্রতিভাবান সেনাপতি, যিনি উহুদে মুসলিমদের বিরুদ্ধে লড়েছিলেন; হুদায়বিয়ার সন্ধির পর ভাবেন এ ইসলামের বিজয় সুস্পষ্ট। নিজ ইচ্ছায় মদিনায় এসে নবীজির কাছে বাইআত করেন।",
      },
    },
    {
      id: "amr",
      name: { en: "Amr ibn al-As", bn: "আমর ইবনুল আস" },
      arabicName: "عمرو بن العاص",
      role: { en: "Conqueror of Egypt", bn: "মিশর বিজয়ী" },
      year: { en: "c. 573–664 CE", bn: "আনু. ৫৭৩–৬৬৪ খ্রি." },
      bio: {
        en: "A shrewd statesman and commander who accepted Islam shortly before the conquest of Makkah. He later led the conquest of Egypt and governed it.",
        bn: "একজন বিচক্ষণ রাজনীতিবিদ ও সেনাপতি, মক্কা বিজয়ের কিছু আগে ইসলাম গ্রহণ করেন। পরে মিশর বিজয়ের নেতৃত্ব দেন ও তা শাসন করেন।",
      },
      story: {
        en: "A shrewd Qurayshi leader who had once opposed the Muslims, he too became convinced Islam would prevail. He travelled to Madinah with Khalid ibn al-Walid and accepted Islam shortly before the conquest of Makkah.",
        bn: "এক বিচক্ষণ কুরাইশ নেতা, একসময় মুসলিমদের বিরোধিতা করলেও পরে নিশ্চিত হন যে ইসলামই জয়ী হবে। খালিদ ইবনুল ওয়ালিদের সঙ্গে মদিনায় এসে মক্কা বিজয়ের কিছু আগে ইসলাম গ্রহণ করেন।",
      },
    },
  ],
};

// Compute a top-down tree layout: leaves are spread evenly, parents centered over children.
function layoutTree(root: RawPerson): { nodes: LaidOutNode[]; width: number; height: number } {
  const nodes: LaidOutNode[] = [];
  let cursorX = 0;

  const assign = (person: RawPerson, depth: number, parentId: string | null): number => {
    const y = depth * (NODE_H + V_GAP);
    let x: number;

    if (person.children && person.children.length > 0) {
      const childCenters = person.children.map((c) => assign(c, depth + 1, person.id));
      x = (childCenters[0] + childCenters[childCenters.length - 1]) / 2;
    } else {
      x = cursorX;
      cursorX += NODE_W + H_GAP;
    }

    nodes.push({ id: person.id, parentId, depth, person, x, y });
    return x;
  };

  assign(root, 0, null);

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  // Normalize so the leftmost node sits at x=0, then add padding around everything.
  nodes.forEach((n) => {
    n.x = n.x - minX + CANVAS_PADDING;
    n.y = n.y + CANVAS_PADDING;
  });

  return {
    nodes,
    width: maxX - minX + NODE_W + CANVAS_PADDING * 2,
    height: maxY + NODE_H + CANVAS_PADDING * 2,
  };
}

export function ConversionTree() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const t = translations[language].conversionTree;

  const labels = {
    en: {
      instructions:
        "🖐️ Drag the canvas to pan • Drag a card to move it • Click a card to read their story",
      convertedThrough: "Accepted Islam through",
      directly: "Directly by the Prophet (ﷺ)",
      storyLabel: "How they came to Islam",
      aboutLabel: "About",
      reset: "Reset layout",
      fit: "Center",
      close: "Close",
    },
    bn: {
      instructions:
        "🖐️ ক্যানভাস টেনে সরান • কার্ড টেনে সরান • গল্প পড়তে কার্ডে ক্লিক করুন",
      convertedThrough: "যাঁর মাধ্যমে ইসলাম গ্রহণ",
      directly: "সরাসরি নবীজি (সা.)-এর মাধ্যমে",
      storyLabel: "যেভাবে ইসলাম গ্রহণ করেন",
      aboutLabel: "পরিচিতি",
      reset: "পুনরায় সাজান",
      fit: "কেন্দ্রে",
      close: "বন্ধ",
    },
  }[lang];

  const { nodes, width, height } = useMemo(() => layoutTree(treeData), []);
  const nodeById = useMemo(() => {
    const m = new Map<string, LaidOutNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const initialPositions = useMemo(() => {
    const p: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => (p[n.id] = { x: n.x, y: n.y }));
    return p;
  }, [nodes]);

  const [positions, setPositions] = useState(initialPositions);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const viewportRef = useRef<HTMLDivElement>(null);

  // Interaction bookkeeping stored in a ref so listeners always see fresh values.
  const drag = useRef<{
    mode: "none" | "pan" | "card";
    nodeId: string | null;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({ mode: "none", nodeId: null, startX: 0, startY: 0, originX: 0, originY: 0, moved: false });

  const centerCanvas = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const root = positions["muhammad"];
    // Put the root node near the top-center of the viewport.
    setPan({
      x: vp.clientWidth / 2 - (root.x + NODE_W / 2),
      y: 80 - root.y,
    });
  }, [positions]);

  useLayoutEffect(() => {
    centerCanvas();
    // Center once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCardPointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const pos = positions[nodeId];
    drag.current = {
      mode: "card",
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
      moved: false,
    };
  };

  const onCanvasPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      mode: "pan",
      nodeId: null,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.mode === "none") return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;

    if (d.mode === "pan") {
      setPan({ x: d.originX + dx, y: d.originY + dy });
    } else if (d.mode === "card" && d.nodeId) {
      setPositions((prev) => ({
        ...prev,
        [d.nodeId!]: { x: d.originX + dx, y: d.originY + dy },
      }));
    }
  };

  const onPointerUp = (e: React.PointerEvent, nodeId?: string) => {
    const d = drag.current;
    // Treat a non-drag press on a card as a click → open drawer.
    if (d.mode === "card" && !d.moved && nodeId) {
      setSelectedId(nodeId);
    }
    drag.current = { ...d, mode: "none", nodeId: null, moved: false };
  };

  const selected = selectedId ? nodeById.get(selectedId) : null;
  const parentOfSelected =
    selected && selected.parentId ? nodeById.get(selected.parentId) : null;

  // Build connector paths from each node to its parent using current positions.
  const edges = nodes
    .filter((n) => n.parentId)
    .map((n) => {
      const child = positions[n.id];
      const parent = positions[n.parentId!];
      const x1 = parent.x + NODE_W / 2;
      const y1 = parent.y + NODE_H;
      const x2 = child.x + NODE_W / 2;
      const y2 = child.y;
      const my = (y1 + y2) / 2;
      return {
        id: n.id,
        d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`,
      };
    });

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

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rule bg-primary-subtle px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-primary">
            <Move size={16} /> {labels.instructions}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={centerCanvas}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm text-ink transition hover:border-rule-strong hover:shadow-sm"
            >
              <Maximize2 size={14} /> {labels.fit}
            </button>
            <button
              type="button"
              onClick={() => {
                setPositions(initialPositions);
                setTimeout(centerCanvas, 0);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm text-ink transition hover:border-rule-strong hover:shadow-sm"
            >
              {labels.reset}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width canvas */}
      <div className="mt-6">
        <div
          ref={viewportRef}
          className="ct-viewport relative w-full overflow-hidden border-y border-rule bg-surface-sunken"
          style={{ height: "90vh", touchAction: "none", cursor: "grab" }}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => onPointerUp(e)}
          onPointerCancel={(e) => onPointerUp(e)}
        >
          {/* Dotted grid background */}
          <div className="ct-grid pointer-events-none absolute inset-0" />

          {/* Transformed world layer */}
          <div
            className="absolute left-0 top-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              width,
              height,
            }}
          >
            {/* Connector lines */}
            <svg
              className="pointer-events-none absolute left-0 top-0"
              width={width}
              height={height}
              style={{ overflow: "visible" }}
            >
              {edges.map((e) => (
                <path
                  key={e.id}
                  d={e.d}
                  fill="none"
                  stroke="var(--rule-strong)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Cards */}
            {nodes.map((n) => {
              const pos = positions[n.id];
              const isRoot = n.parentId === null;
              const isSelected = selectedId === n.id;
              return (
                <div
                  key={n.id}
                  className={`ct-card ${isRoot ? "ct-card--root" : ""} ${
                    isSelected ? "ct-card--selected" : ""
                  }`}
                  style={{
                    left: pos.x,
                    top: pos.y,
                    width: NODE_W,
                    minHeight: NODE_H,
                  }}
                  onPointerDown={(e) => onCardPointerDown(e, n.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    onPointerUp(e, n.id);
                  }}
                  onPointerCancel={(e) => onPointerUp(e, n.id)}
                >
                  <div className="ct-card__name">{n.person.name[lang]}</div>
                  {n.person.arabicName && (
                    <div className="ct-card__arabic">{n.person.arabicName}</div>
                  )}
                  <div className="ct-card__role">{n.person.role[lang]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-ink-muted">{t.note}</p>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto bg-surface text-ink">
          {selected && (
            <>
              <SheetHeader className="text-left">
                <div className="mb-1 text-sm text-ink-muted">{selected.person.year[lang]}</div>
                <SheetTitle className="font-display text-2xl text-ink">
                  {selected.person.name[lang]}
                </SheetTitle>
                {selected.person.arabicName && (
                  <div
                    className="text-lg text-accent"
                    style={{ fontFamily: "var(--font-arabic-stack)", direction: "rtl" }}
                  >
                    {selected.person.arabicName}
                  </div>
                )}
                <SheetDescription className="sr-only">
                  {selected.person.role[lang]}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-2 space-y-5 px-4 pb-8">
                <span className="inline-block rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
                  {selected.person.role[lang]}
                </span>

                {/* Conversion chain */}
                <div className="rounded-xl border border-rule bg-surface-sunken p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-ink-faint">
                    {labels.convertedThrough}
                  </div>
                  <div className="font-medium text-ink">
                    {parentOfSelected
                      ? parentOfSelected.person.name[lang]
                      : labels.directly}
                  </div>
                  {parentOfSelected && parentOfSelected.parentId === null && (
                    <div className="mt-1 text-sm text-ink-muted">{labels.directly}</div>
                  )}
                </div>

                {/* Conversion story — how they came to Islam */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-4 w-1 rounded bg-accent" />
                    <h3 className="text-sm font-semibold text-ink">{labels.storyLabel}</h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    {selected.person.story[lang]}
                  </p>
                </div>

                {/* General bio */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-4 w-1 rounded bg-primary" />
                    <h3 className="text-sm font-semibold text-ink">{labels.aboutLabel}</h3>
                  </div>
                  <p className="text-[15px] leading-relaxed text-ink-soft">
                    {selected.person.bio[lang]}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <style>{`
        .ct-grid {
          background-image: radial-gradient(var(--rule-strong) 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.5;
        }

        .ct-card {
          position: absolute;
          box-sizing: border-box;
          background: var(--surface);
          color: var(--ink);
          border: 1px solid var(--rule);
          border-top: 3px solid var(--accent);
          border-radius: 12px;
          box-shadow: var(--shadow-card);
          padding: 12px 16px;
          text-align: center;
          cursor: grab;
          user-select: none;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.05s;
          touch-action: none;
        }

        .ct-card:hover {
          box-shadow: var(--shadow-lifted);
          border-color: var(--rule-strong);
          border-top-color: var(--accent);
          z-index: 5;
        }

        .ct-card:active {
          cursor: grabbing;
        }

        .ct-card--selected {
          box-shadow: var(--shadow-lifted);
          border-color: var(--primary);
          z-index: 6;
        }

        .ct-card--root {
          background: var(--primary);
          color: #fff;
          border: 1px solid var(--primary-strong);
          border-top: 3px solid var(--accent);
          box-shadow: var(--shadow-lifted);
        }

        .ct-card__name {
          font-weight: 600;
          font-size: 14px;
          line-height: 1.35;
        }

        .ct-card--root .ct-card__name {
          font-size: 15px;
        }

        .ct-card__arabic {
          font-size: 14px;
          color: var(--accent);
          font-family: var(--font-arabic-stack);
          direction: rtl;
          unicode-bidi: isolate;
          margin-top: 3px;
        }

        .ct-card--root .ct-card__arabic {
          color: rgba(255, 255, 255, 0.85);
        }

        .ct-card__role {
          margin-top: 5px;
          font-size: 11px;
          color: var(--ink-muted);
          line-height: 1.3;
        }

        .ct-card--root .ct-card__role {
          color: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}
