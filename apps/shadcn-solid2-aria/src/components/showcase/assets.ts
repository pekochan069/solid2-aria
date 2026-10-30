/*
 * Copyright (c) 2023 shadcn
 * Derived from shadcn/ui (https://github.com/shadcn-ui/ui): apps/v4/app/(app)/(styles)/sera/media-library/data.ts.
 * Modified for Solid Aria: Solid 2 reactive data and local component imports.
 * Licensed under MIT. See ../../../LICENSES/shadcn-ui-MIT.txt and NOTICE.txt at the repository root.
 */

export type AssetType = "JPEG" | "PNG" | "WEBP" | "MP4" | "PDF";

export interface Asset {
  id: string;
  name: string;
  date: string;
  size: string;
  type: AssetType;
  dimensions: string;
  duration?: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedOn: string;
  tags: string[];
  usedIn: { title: string; role: string }[];
}

export const ASSETS: Asset[] = [
  {
    date: "Oct 24",
    dimensions: "4000 × 3000",
    id: "1",
    name: "brutalism-facade-01.jpg",
    size: "4.2 MB",
    tags: ["architecture", "brutalism", "exterior", "summer-issue"],
    type: "JPEG",
    uploadedBy: "Marcus Chen",
    uploadedByInitials: "MC",
    uploadedOn: "Oct 24, 2024",
    usedIn: [
      { role: "Cover Image", title: "Brutalism's Second Act" },
      { role: "Inline Gallery", title: "Autumn Sartorial Code" },
    ],
  },
  {
    date: "Oct 24",
    dimensions: "3800 × 2850",
    id: "2",
    name: "brutalism-interior-raw.jpg",
    size: "3.8 MB",
    tags: ["architecture", "brutalism", "interior"],
    type: "JPEG",
    uploadedBy: "Marcus Chen",
    uploadedByInitials: "MC",
    uploadedOn: "Oct 24, 2024",
    usedIn: [{ role: "Inline Gallery", title: "Brutalism's Second Act" }],
  },
  {
    date: "Oct 22",
    dimensions: "2000 × 1500",
    id: "3",
    name: "seattle-living-building-diagram.png",
    size: "1.1 MB",
    tags: ["diagram", "sustainability", "seattle"],
    type: "PNG",
    uploadedBy: "Sarah Jenkins",
    uploadedByInitials: "SJ",
    uploadedOn: "Oct 22, 2024",
    usedIn: [
      { role: "Diagram", title: "The Future of Sustainable Architecture" },
    ],
  },
  {
    date: "Oct 18",
    dimensions: "1920 × 1080",
    duration: "0:45",
    id: "4",
    name: "interview-sofia-coppola-clip1.mp4",
    size: "45.0 MB",
    tags: ["video", "interview", "film"],
    type: "MP4",
    uploadedBy: "Emma Ross",
    uploadedByInitials: "ER",
    uploadedOn: "Oct 18, 2024",
    usedIn: [{ role: "Featured Video", title: "The Aesthetics of Isolation" }],
  },
  {
    date: "Oct 15",
    dimensions: "4500 × 3000",
    id: "5",
    name: "kyoto-kilns-pottery-detail.jpg",
    size: "5.6 MB",
    tags: ["ceramics", "kyoto", "craft"],
    type: "JPEG",
    uploadedBy: "Marcus Chen",
    uploadedByInitials: "MC",
    uploadedOn: "Oct 15, 2024",
    usedIn: [{ role: "Hero Image", title: "Kyoto's Oldest Kilns" }],
  },
  {
    date: "Oct 12",
    dimensions: "3600 × 2400",
    id: "6",
    name: "copenhagen-design-week-street.jpg",
    size: "3.2 MB",
    tags: ["copenhagen", "design-week", "street"],
    type: "JPEG",
    uploadedBy: "Noah Bennett",
    uploadedByInitials: "NB",
    uploadedOn: "Oct 12, 2024",
    usedIn: [{ role: "Inline Gallery", title: "Field Notes from Copenhagen" }],
  },
  {
    date: "Oct 10",
    dimensions: "2400 × 1600",
    id: "7",
    name: "minimalist-chair-render.webp",
    size: "0.8 MB",
    tags: ["furniture", "minimalism", "render"],
    type: "WEBP",
    uploadedBy: "Claire Duval",
    uploadedByInitials: "CD",
    uploadedOn: "Oct 10, 2024",
    usedIn: [{ role: "Product Shot", title: "The New Vanguard" }],
  },
  {
    date: "Oct 05",
    dimensions: "N/A",
    id: "8",
    name: "autumn-issue-style-guide.pdf",
    size: "12.4 MB",
    tags: ["guidelines", "internal", "autumn"],
    type: "PDF",
    uploadedBy: "Emma Ross",
    uploadedByInitials: "ER",
    uploadedOn: "Oct 05, 2024",
    usedIn: [{ role: "Reference", title: "Autumn Issue 2024" }],
  },
  {
    date: "Oct 09",
    dimensions: "5200 × 3466",
    id: "9",
    name: "milan-lighting-studio-visit.jpg",
    size: "6.1 MB",
    tags: ["milan", "lighting", "studio"],
    type: "JPEG",
    uploadedBy: "Claire Duval",
    uploadedByInitials: "CD",
    uploadedOn: "Oct 09, 2024",
    usedIn: [
      { role: "Hero Image", title: "Milan's Most Elusive Lighting Designer" },
    ],
  },
  {
    date: "Oct 14",
    dimensions: "3000 × 2000",
    id: "10",
    name: "lisbon-culinary-scene-raw.webp",
    size: "2.4 MB",
    tags: ["lisbon", "food", "editorial"],
    type: "WEBP",
    uploadedBy: "Amara Iqbal",
    uploadedByInitials: "AI",
    uploadedOn: "Oct 14, 2024",
    usedIn: [
      { role: "Inline Gallery", title: "Lisbon's Quiet Culinary Renaissance" },
    ],
  },
  {
    date: "Sep 26",
    dimensions: "3200 × 2400",
    id: "11",
    name: "print-magazine-covers-mo...",
    size: "8.9 MB",
    tags: ["print", "magazine", "covers"],
    type: "PNG",
    uploadedBy: "Mina Okafor",
    uploadedByInitials: "MO",
    uploadedOn: "Sep 26, 2024",
    usedIn: [{ role: "Cover Image", title: "The Return of Print" }],
  },
  {
    date: "Sep 30",
    dimensions: "3840 × 2160",
    duration: "1:12",
    id: "12",
    name: "avant-garde-furniture-trailer.mp4",
    size: "78.2 MB",
    tags: ["video", "furniture", "trailer"],
    type: "MP4",
    uploadedBy: "Tommy Rhodes",
    uploadedByInitials: "TR",
    uploadedOn: "Sep 30, 2024",
    usedIn: [
      { role: "Featured Video", title: "Collecting the New Avant-Garde" },
    ],
  },
];
