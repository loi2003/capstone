import { chartData } from './chartData';

export const homepageData = {
  hero: {
    title: "Welcome, Mom-to-be",
    subtitle: "A safe, healthy, and fulfilling pregnancy journey with us",
    tagline: "Supporting moms-to-be from the very first steps to the day you welcome your baby",
    quote: "Each week is a milestone worth remembering on the journey to motherhood",
    cta: "Explore Now",
    ctaLink: "/about",
    secondaryCta: "Get a Free Consultation",
    secondaryCtaLink: "/consultation",
    pregnancyTipsLink: "/advice",
    pregnancyTipsText: "Discover essential health tips for your pregnancy journey",
  },
  features: [
    {
      title: "Pregnancy Nutrition",
      description: "Healthy and balanced diet plans for mom and baby in each trimester.",
      icon: "🍎",
    },
    {
      title: "Safe Exercise",
      description: "Gentle yoga and light workout routines suitable for each stage of pregnancy.",
      icon: "🏃‍♀️",
    },
    {
      title: "Emotional Support",
      description: "Mental wellness care to reduce stress and keep moms happy.",
      icon: "💖",
    },
    {
      title: "Health Monitoring",
      description: "Accurate tools to track weight, blood pressure, and pregnancy health.",
      icon: "📈",
    },
    {
      title: "Mom-to-be Community",
      description: "Connect, share experiences, and support one another with other expecting moms.",
      icon: "👥",
    },
    {
      title: "Prenatal Education",
      description: "Courses and materials on pre- and postnatal care from experts.",
      icon: "📚",
    },
    {
      title: "Expert Consultation",
      description: "Connect directly with doctors and obstetrics experts via online consultation.",
      icon: "🩺",
    },
    {
      title: "40-Week Pregnancy Tracker",
      description: "Track your baby's development week by week with detailed info and useful tips.",
      icon: "📅",
    },
    {
      title: "Baby Journal",
      description: "Record milestones and preserve precious pregnancy memories.",
      icon: "✍️",
    },
  ],
  testimonials: [
    {
      name: "Nguyen Minh Anh",
      feedback: "I feel more confident with detailed guidance on nutrition and exercise!",
      avatar: "https://via.placeholder.com/50",
    },
    {
      name: "Tran Thuy Linh",
      feedback: "The mom-to-be community is amazing, I found so many useful tips.",
      avatar: "https://via.placeholder.com/50",
    },
    {
      name: "Le Thi Hong Nhung",
      feedback: "The health tracking tools make me feel more reassured during pregnancy.",
      avatar: "https://via.placeholder.com/50",
    },
    {
      name: "Pham Ngoc Ha",
      feedback: "The prenatal course was very practical and helped me prepare well for birth.",
      avatar: "https://via.placeholder.com/50",
    },
    {
      name: "Hoang Thi Mai",
      feedback: "The 40-week tracker helped me know exactly how my baby was developing each week!",
      avatar: "https://via.placeholder.com/50",
    },
    {
      name: "Vu Thi Thanh Tam",
      feedback: "The baby journal is a wonderful way to keep precious memories.",
      avatar: "https://via.placeholder.com/50",
    },
  ],
  community: {
    title: "Join Our Blog",
    description: "Connect with over 10,000 moms-to-be to share experiences, read insightful blog posts, and participate in online discussions.",
    cta: "Join Now",
    ctaLink: "/blog",
    highlight: "Join the '40-Week Journey' blog for weekly tips and support from other moms-to-be!",
  },
  pregnancyGuides: {
    title: "Pregnancy Guides & Tools",
    description: "Explore tools and guides to support your pregnancy journey, from tracking milestones to planning meals.",
    items: [
      {
        title: "Due Date Calculator",
        description: "Calculate your expected due date with our easy-to-use tool.",
        link: "/duedate-calculator",
      },
      {
        title: "Pregnancy Tracking",
        description: "Track your baby’s development week by week with detailed insights.",
        link: "/pregnancy-tracking",
      },
      {
        title: "Nutritional Guidance",
        description: "Discover meal plans and nutrition tips tailored for pregnancy.",
        link: "/nutritional-guidance",
      },
      {
        title: "Baby Journal",
        description: "Record and cherish every milestone in your pregnancy journey.",
        link: "/pregnancy-tracking/journal-section",
      },
      {
        title: "System Meal Planner",
        description: "Plan healthy meals for you and your baby with our meal planner tool.",
        link: "/system-meal-planner",
      },
    ],
    cta: "Explore More Tools",
    ctaLink: "/pregnancy-tracking",
  },
  pregnancyTracker: {
    title: "40-Week Pregnancy Tracker",
    description: "Your 40-week journey supported with detailed baby development info, health tips, and important milestones.",
    cta: "Start Tracking",
    ctaLink: "/pregnancy-tracking",
    milestones: [
      {
        week: 4,
        title: "Week 4: Embryo Formation",
        description: "The embryo begins to form, and the gestational sac and placenta start developing. The baby's heart begins to beat faintly.",
        tip: "Start taking folic acid (400–800 mcg/day) to support neural tube development.",
      },
      {
        week: 12,
        title: "Week 12: End of First Trimester",
        description: "Baby is about the size of a lemon, and major organs are formed.",
        tip: "Attend your first ultrasound to see your little one.",
      },
      {
        week: 20,
        title: "Week 20: First Definite Kicks",
        description: "Baby starts making noticeable movements, and you may feel the first kicks.",
        tip: "Record this special moment in your baby journal!",
      },
      {
        week: 28,
        title: "Week 28: Third Trimester Begins",
        description: "Baby grows quickly, and eyes can open and close. Mom needs more energy.",
        tip: "Increase foods rich in iron and calcium.",
      },
      {
        week: 36,
        title: "Week 36: Ready to Meet Mom",
        description: "Baby is ready for birth, and mom should prepare her hospital bag.",
        tip: "Practice breathing and relaxation techniques to prepare for labor.",
      },
    ],
    chartData,
  },
  healthTips: {
    title: "Health Tips for Each Trimester",
    description: "Practical advice to keep both mom and baby healthy throughout the pregnancy.",
    items: [
      {
        trimester: "First Trimester",
        tips: [
          "Take folic acid to support the development of your baby’s neural tube.",
          "Avoid stress, get enough rest, and eat small frequent meals.",
        ],
      },
      {
        trimester: "Second Trimester",
        tips: [
          "Do light exercises like yoga or walking to improve health.",
          "Drink plenty of water and eat fiber-rich foods to prevent constipation.",
        ],
      },
      {
        trimester: "Third Trimester",
        tips: [
          "Sleep on your left side to improve blood circulation to your baby.",
          "Prepare a birth plan and consult your doctor about labor.",
        ],
      },
    ],
    cta: "View More Health Tips",
    ctaLink: "/health-tips",
  },
  partners: {
    title: "Our Partners",
    description: "We collaborate with trusted medical organizations and brands to bring the best services to moms-to-be.",
    items: [
      {
        name: "International Maternity Hospital",
        logo: "https://via.placeholder.com/100x50",
        link: "https://www.example-hospital.com",
      },
      {
        name: "Vietnam Nutrition Association",
        logo: "https://via.placeholder.com/100x50",
        link: "https://www.example-nutrition.org",
      },
      {
        name: "Mom-to-be Milk Brand",
        logo: "https://via.placeholder.com/100x50",
        link: "https://www.example-brand.com",
      },
      {
        name: "Pregnancy Tracking App",
        logo: "https://via.placeholder.com/100x50",
        link: "https://www.example-tracker.com",
      },
      {
        name: "Prenatal Ultrasound Center",
        logo: "https://via.placeholder.com/100x50",
        link: "https://www.example-ultrasound.com",
      },
    ],
  },
};
export default homepageData;