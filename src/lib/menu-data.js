import {
  Settings,
  User,
  UserRound,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Bell,
  BookOpen,
  GitBranch,
  ClipboardList,
} from "lucide-react";

const Icons = {
  Settings,
  User,
  UserRound,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Bell,
  BookOpen,
  GitBranch,
  ClipboardList,
};

// MenuItem now uses Lucide icon component
export const MenuItem = {
  // This is just a schema reference, not needed in JS
};

export const menuData = [
  {
    title: "Account",
    items: [
      {
        title: "Personal information",
        href: "/profile/personal",
        icon: Icons.UserRound,
      },
      {
        title: "Education",
        href: "/profile/education",
        icon: Icons.GraduationCap,
      },
      {
        title: "Family",
        href: "/profile/family",
        icon: Icons.Users,
      },
      {
        title: "Certification",
        href: "/profile/certification",
        icon: Icons.Award,
      },
    ],
  },
  {
    title: "Widgets",
    items: [
      {
        title: "Mathurat",
        description: "Daily supplications",
        href: "/mathurat",
        icon: Icons.BookOpen,
      },
      {
        title: "HQ Tree",
        description: "View your HQ tree",
        href: "/hq-tree",
        icon: Icons.GitBranch,
      },
      {
        title: "CCS Form",
        description: "Submit a CCS form",
        href: "/ccs-form",
        icon: Icons.ClipboardList,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Notifications",
        href: "/user/notification-settings",
        icon: Icons.Bell,
      },
      {
        title: "Security",
        href: "/profile/security",
        icon: Icons.ShieldCheck,
      },
    ],
  },
];
