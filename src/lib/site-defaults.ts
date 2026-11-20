// ===========================================================================
// داده‌های پیش‌فرض سایت (Fallback برای SSR قبل از اتصال دیتابیس + Seed)
// ===========================================================================
import { SiteSettings, Product } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "شرکت فناوری اطلاعات دانشگاه صنعتی شریف",
  siteShortName: "شریف‌تک",
  tagline: "تحول دیجیتال صنایع با هوش مصنوعی",
  heroTitle: "هوش مصنوعی در قلب صنایع نفت، گاز و پتروشیمی",
  heroSubtitle:
    "از ایجنت‌های هوشمند صنعتی تا داشبوردهای مدیریتی لحظه‌ای؛ ما با پیشرفته‌ترین فناوری‌های هوش مصنوعی، آینده کسب‌وکار شما را می‌سازیم.",
  phone: "021-66000000",
  email: "info@shariftech.ir",
  address: "تهران، خیابان آزادی، دانشگاه صنعتی شریف، پارک علم و فناوری",
  linkedin: "https://linkedin.com/company/shariftech",
  instagram: "https://instagram.com/shariftech",
  telegram: "https://t.me/shariftech",
};

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "industrial-agent-suite",
    title: "سوئیت ایجنت‌های صنعتی شریف",
    subtitle: "Sharif Industrial Agent Suite",
    category: "AI_AGENT",
    summary:
      "ایجنت‌های خودکار مبتنی بر مدل‌های زبانی پیشرفته برای پایش، عیب‌یابی و اتوماسیون فرآیندهای صنعتی.",
    description:
      "سوئیت ایجنت‌های صنعتی شریف، مجموعه‌ای از عامل‌های هوشمند خودگردان است که با اتصال به SCADA، IoT و سامانه‌های تخصصی، فرآیندهای صنعتی را به‌صورت خودکار پایش، تحلیل و مدیریت می‌کند. هر ایجنت دانش تخصصی حوزه خود را دارد و می‌تواند گزارش‌های فنی، علت‌یابی ریشه‌ای و پیشنهاد عملیاتی را در قالب زبان طبیعی ارائه دهد.",
    features: [
      "اتصال زنده به سامانه‌های SCADA و IoT",
      "عیب‌یابی خودکار تجهیزات با LLM",
      "گزارش‌دهی هوشمند روزانه و هفتگی",
      "دستیار گفتگومحور اپراتور (ChatOps)",
      "عامل‌های تخصصی RCM و ایمنی فرآیند",
    ],
    useCases: [
      {
        title: "عیب‌یابی خودکار توربوکمپرسورها",
        description:
          "ایجنت با تحلیل لحظه‌ای ارتعاش، دما و فشار، علت ریشه‌ای افت راندمان را شناسایی و راهکار اصلاحی را به اپراتور پیشنهاد می‌دهد.",
      },
      {
        title: "پایش هوشمند واحدهای فرآیندی",
        description:
          "خواندن پیوسته تگ‌های DCS، کشف انحراف از حالت پایدار و تولید دستور کار برای واحد کنترل.",
      },
    ],
    techStack: ["LLM Engine", "OPC-UA", "MQTT", "TimescaleDB", "Docker"],
    image: "/products/agent-suite.jpg",
    icon: "Bot",
    accent: "emerald",
    featured: true,
    status: "PUBLISHED",
    sort: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p2",
    slug: "energy-optimization-agent",
    title: "ایجنت بهینه‌سازی انرژی",
    subtitle: "Energy Optimization Agent",
    category: "AI_AGENT",
    summary:
      "کاهش هزینه سوخت و انرژی با ایجنت هوشمندی که الگوی مصرف را لحظه‌ای تحلیل و بهینه می‌کند.",
    description:
      "این ایجنت با تحلیل لحظه‌ای داده‌های مصرف انرژی در واحدهای فرآیندی، نقشه راه کاهش مصرف را ارائه و اکشن‌های بهینه‌سازی را پیشنهاد می‌دهد. موتور بهینه‌سازی با ترکیب مدل‌های فیزیکی فرآیند و یادگیری ماشین، نقاط بهینه کاری تجهیزات انرژی‌بر را در هر شرایط تولید پیدا می‌کند.",
    features: [
      "تحلیل لحظه‌ای الگوی مصرف",
      "پیشنهاد خودکار اکشن‌های کاهش هزینه",
      "داشبورد ROI و صرفه‌جویی",
      "هم‌گرایی با قیمت‌گذاری انرژی و کربن",
    ],
    useCases: [
      {
        title: "بهینه‌سازی کوره‌های پالایشگاه",
        description:
          "کاهش مصرف سوخت کوره با تنظیم خودکار نسبت هوا به سوخت و پایش راندمان احتراق.",
      },
    ],
    techStack: ["Reinforcement Learning", "Digital Twin Core", "Grafana"],
    image: "/products/energy-agent.jpg",
    icon: "Zap",
    accent: "amber",
    featured: false,
    status: "PUBLISHED",
    sort: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p3",
    slug: "petro-executive-dashboard",
    title: "داشبورد جامع مدیریت تولید نفت و گاز",
    subtitle: "Petro Executive Dashboard",
    category: "DASHBOARD",
    summary:
      "تصویر کامل و لحظه‌ای از تولید، تزریق، ذخیره و فروش برای مدیران ارشد صنایع بالادستی و پایین‌دستی.",
    description:
      "داشبورد مدیریتی یکپارچه برای پایش شاخص‌های کلیدی عملکرد (KPI) در میادین نفتی، واحدهای پتروشیمی و پالایشگاه‌ها با قابلیت Drill-down تا سطح تک‌تک تجهیزات. گزارش‌های مدیریتی روزانه به‌صورت خودکار ساخته و برای مدیران ارسال می‌شود.",
    features: [
      "پایش لحظه‌ای KPI های تولید",
      "گزارش‌ساز خودکار مدیریتی",
      "تحلیل روند و پیش‌بینی تولید",
      "امنیت و سطوح دسترسی سازمانی",
      "نمای موبایل برای مدیران متحرک",
    ],
    useCases: [
      {
        title: "ستاد تولید شرکت ملی‌منطقه",
        description:
          "تجمیع داده چند میدان گازی در یک نمای واحد با مقایسه هدف و عملکرد روزانه.",
      },
      {
        title: "کارتل مدیریت پتروشیمی",
        description:
          "پایش لحظه‌ای خوراک، محصول و انرژی واحدهای الفین و اتیلن با هشدار انحراف.",
      },
    ],
    techStack: ["React", "Node.js", "PostgreSQL", "Redis", "Kafka"],
    image: "/products/petro-dashboard.jpg",
    icon: "LayoutDashboard",
    accent: "teal",
    featured: true,
    status: "PUBLISHED",
    sort: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p4",
    slug: "refinery-realtime-ops",
    title: "داشبورد پایش لحظه‌ای پالایشگاه",
    subtitle: "Refinery Realtime Operations",
    category: "DASHBOARD",
    summary:
      "نظارت زنده بر واحدهای فرآیندی پالایشگاه با هشدارهای هوشمند و تحلیل انحراف از حالت بهینه.",
    description:
      "داشبورد عملیات پالایشگاه با موتور هشدار هوشمند، انحرافات فرآیند را پیش از تبدیل به توقف تولید شناسایی می‌کند. نقشه حرارتی واحدها، خطوط روند بلندمدت و گزارش شیفت کاری از قابلیت‌های اصلی این سیستم است.",
    features: [
      "موتور هشدار هوشمند چندسطحی",
      "نقشه حرارتی واحدهای فرآیندی",
      "تحلیل انحراف (Deviation Analysis)",
      "گزارش شیفت خودکار",
    ],
    useCases: [
      {
        title: "واحد تقطیر اتمسفری (CDU)",
        description:
          "پایش ۲۴۰۰ تگ فرآیندی با تشخیص زودهنگام انحراف دمای برج و کیفیت برش‌ها.",
      },
    ],
    techStack: ["OPC-UA", "InfluxDB", "WebSocket", "React"],
    image: "/products/refinery-ops.jpg",
    icon: "Gauge",
    accent: "cyan",
    featured: false,
    status: "PUBLISHED",
    sort: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p5",
    slug: "predictive-maintenance",
    title: "سیستم نگهداری پیش‌بینانه",
    subtitle: "Predictive Maintenance (PdM)",
    category: "SMART_SYSTEM",
    summary:
      "پیش‌بینی خرابی تجهیزات حساس با یادگیری ماشین و کاهش توقفات ناخواسته تا ۴۵ درصد.",
    description:
      "سیستم PdM شریف با ترکیب داده‌های ارتعاش، دما و جریان، سلامت تجهیزات دوار را مدل‌سازی و زمان باقی‌مانده تا خرابی (RUL) را پیش‌بینی می‌کند. زمان‌بندی تعمیرات از حالت واکنشی به پیش‌بینانه تغییر می‌کند و هزینه‌های نگهداری به‌شکل محسوس کاهش می‌یابد.",
    features: [
      "پیش‌بینی Remaining Useful Life",
      "تشخیص زودهنگام ناهنجاری",
      "زمان‌بندی خودکار تعمیرات",
      "پروفایل سلامت هر تجهیز",
    ],
    useCases: [
      {
        title: "پمپ‌های درازمدت خطوط انتقال",
        description:
          "مدل‌سازی سلامت ۱۲۰ پمپ و کاهش ۴۰ درصدی توقفات اضطراری در ۶ ماه نخست.",
      },
    ],
    techStack: ["PyTorch", "Signal Processing", "TimeSeries DB"],
    image: "/products/predictive-maintenance.jpg",
    icon: "Activity",
    accent: "emerald",
    featured: true,
    status: "PUBLISHED",
    sort: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p6",
    slug: "vision-safety",
    title: "بینایی ماشین برای پایش ایمنی (HSE)",
    subtitle: "Computer Vision Safety",
    category: "SMART_SYSTEM",
    summary:
      "تشخیص خودکار نقض ایمنی، آتش و نشت با دوربین‌های موجود سایت و مدل‌های بینایی ماشین.",
    description:
      "سیستم بینایی ماشین شریف روی دوربین‌های مداربسته موجود اجرا می‌شود و مواردی مانند نبود PPE، ورود به مناطق خطر و نشت محصولات را در لحظه تشخیص می‌دهد. هشدارها به‌صورت هم‌زمان به مرکز کنترل، گوشی سرپرست شیفت و سامانه HSE ارسال می‌شود.",
    features: [
      "تشخیص PPE و حادثه در لحظه",
      "هشدار یکپارچه با مرکز کنترل",
      "اجرای Edge روی سخت‌افزار موجود",
      "گزارش ماهانه HSE خودکار",
    ],
    useCases: [
      {
        title: "پایش دکل‌های حفاری",
        description: "تشخیص بدون‌کلاه‌ای و ناحیه ممنوعه با ۹۸٪ دقت در نور کم.",
      },
    ],
    techStack: ["YOLOv10", "Edge TPU", "RTSP", "NVR Integration"],
    image: "/products/vision-safety.jpg",
    icon: "ScanEye",
    accent: "amber",
    featured: false,
    status: "PUBLISHED",
    sort: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p7",
    slug: "digital-twin",
    title: "دوقلوی دیجیتال فرآیند",
    subtitle: "Process Digital Twin",
    category: "SMART_SYSTEM",
    summary:
      "شبیه‌سازی زنده واحدهای فرآیندی برای آزمایش سناریوها بدون ریسک روی خط واقعی.",
    description:
      "دوقلوی دیجیتال شریف با ترکیب مدل‌های سینتیک فرآیند و داده واقعی خط تولید، نسخه زنده‌ای از واحد می‌سازد که تغییر پارامترها را پیش از اعمال روی خط واقعی شبیه‌سازی می‌کند؛ از راه‌اندازی واحد جدید تا بهینه‌سازی خوراک.",
    features: [
      "شبیه‌سازی زنده هم‌گام با خط",
      "آزمایش سناریوی What-If",
      "آموزش اپراتور بدون ریسک",
      "کالیبراسیون خودکار با داده واقعی",
    ],
    useCases: [
      {
        title: "راه‌اندازی واحد جدید",
        description:
          "کاهش ۳۰ درصدی زمان Commissioning با آزمایش پروتکل راه‌اندازی روی دوقلو.",
      },
    ],
    techStack: ["Physics Simulation", "SysID", "WebGL Viewer"],
    image: "/products/digital-twin.jpg",
    icon: "Boxes",
    accent: "violet",
    featured: true,
    status: "PUBLISHED",
    sort: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p8",
    slug: "flare-monitoring",
    title: "پایش هوشمند مشعل و زیست‌محیطی",
    subtitle: "Flare & Emission Monitoring",
    category: "SMART_SYSTEM",
    summary:
      "پایش پیوسته مشعل، اندازه‌گیری رانش و گزارش‌دهی زیست‌محیطی مطابق الزامات سازمان محیط‌زیست.",
    description:
      "این سیستم با تحلیل تصویر حرارتی و داده فرآیندی، میزان رانش مشعل را برآورد و گزارش‌های زیست‌محیطی استاندارد را به‌صورت خودکار تولید می‌کند؛ هشدارهای زودهنگام به کاهش جریمه‌ها و بهبود شاخص‌های HSE کمک می‌کند.",
    features: [
      "برآورد رانش با بینایی حرارتی",
      "گزارش استاندارد زیست‌محیطی",
      "داشبورد عمومی شفافیت",
    ],
    useCases: [
      {
        title: "گزارش‌دهی ماهانه محیط‌زیست",
        description:
          "تولید خودکار گزارش رانش و سوخت‌مشعل برای ۹ واحد عملیاتی در یک ساعت کاری.",
      },
    ],
    techStack: ["Thermal Imaging", "Vision Models", "Reporting Engine"],
    image: "/products/flare-monitoring.jpg",
    icon: "Flame",
    accent: "rose",
    featured: false,
    status: "PUBLISHED",
    sort: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "p9",
    slug: "custom-solutions",
    title: "راهکارهای نرم‌افزاری سفارشی سازمانی",
    subtitle: "Custom Enterprise Solutions",
    category: "CUSTOM",
    summary:
      "طراحی و توسعه سامانه‌های اختصاصی با معماری مدرن — از اتوماسیون اداری تا سامانه‌های تخصصی صنعتی.",
    description:
      "تیم مهندسی شریف‌تک با تجربه پروژه‌های متعدد سازمانی، سامانه‌های سفارشی را از فاز تحلیل نیاز تا استقرار و پشتیبانی اجرا می‌کند. معماری سرویس‌گرا، مستندسازی کامل و تحویل کد منبع از اصول ثابت همه پروژه‌های ماست.",
    features: [
      "تحلیل و مستندسازی کامل نیاز",
      "معماری سرویس‌گرا و مقیاس‌پذیر",
      "تحویل کد منبع و دانش انتقال",
      "پشتیبانی و SLA قراردادی",
    ],
    useCases: [
      {
        title: "سامانه یکپارچه منابع انسانی",
        description:
          "اتوماسیون کامل چرخه کارمند از جذب تا تسویه‌حساب برای یک هلدینگ صنعتی.",
      },
    ],
    techStack: ["Next.js", "NestJS", "PostgreSQL", "Keycloak"],
    image: "/products/custom-solutions.jpg",
    icon: "Code2",
    accent: "violet",
    featured: false,
    status: "PUBLISHED",
    sort: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
