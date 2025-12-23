import {
  Settings,
  User,
  UserRound,
  GraduationCap,
  Users,
  Award,
  ShieldCheck,
  Bell,
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
