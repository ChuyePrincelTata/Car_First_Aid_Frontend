// Types for our global mock data
export type Mechanic = {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  reviewCount: number
  location: string
  address: string
  phone: string
  bio: string
  services: string[]
  avatar: string
  verified: boolean
  latitude: number
  longitude: number
}

export type DiagnosisHistory = {
  id: string
  type: "image" | "sound" | "manual"
  issue: string
  date: string
  severity: "Low" | "Medium" | "High"
  resolved: boolean
}

export const mockMechanics: Mechanic[] = [
  {
    id: "1",
    name: "John Smith",
    specialty: "Engine Specialist",
    experience: "10 yrs exp",
    rating: 4.8,
    reviewCount: 142,
    location: "Downtown Auto Shop",
    address: "14 Main Street, Downtown, Lagos",
    phone: "2348012345678",
    bio: "Passionate engine specialist with over a decade of hands-on experience dealing with all types of engine faults. I provide transparent diagnoses and quality repairs at fair prices.",
    services: ["Engine Overhaul", "Oil Change", "Spark Plug Replacement", "Cooling System Repair", "Timing Belt Service"],
    avatar: "https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg",
    verified: true,
    latitude: 6.4541,
    longitude: 3.3947,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    specialty: "Electrical Systems",
    experience: "8 yrs exp",
    rating: 4.6,
    reviewCount: 98,
    location: "Westside Garage",
    address: "22 Awolowo Road, Ikoyi, Lagos",
    phone: "2348023456789",
    bio: "Certified automotive electrician specializing in fault diagnosis, wiring, battery systems, and modern vehicle electronics. I make complex electrical issues simple.",
    services: ["Wiring Repairs", "Battery Replacement", "ECU Diagnostics", "Alternator Repair", "Car Alarm Systems"],
    avatar: "https://images.pexels.com/photos/8993296/pexels-photo-8993296.jpeg",
    verified: true,
    latitude: 6.4480,
    longitude: 3.4320,
  },
  {
    id: "3",
    name: "Mike Robinson",
    specialty: "Transmission Expert",
    experience: "12 yrs exp",
    rating: 4.9,
    reviewCount: 207,
    location: "Premium Auto Repairs",
    address: "5 Bode Thomas Street, Surulere, Lagos",
    phone: "2348034567890",
    bio: "Nigeria's top-rated transmission expert. I work on both automatic and manual gearboxes, offering factory-level service at competitive rates.",
    services: ["Gearbox Overhaul", "Clutch Replacement", "Transmission Fluid Flush", "Differential Repair", "Drive Shaft"],
    avatar: "https://images.pexels.com/photos/6692038/pexels-photo-6692038.jpeg",
    verified: true,
    latitude: 6.5025,
    longitude: 3.3581,
  },
  {
    id: "4",
    name: "Emily Chen",
    specialty: "Diagnostic Technician",
    experience: "6 yrs exp",
    rating: 4.5,
    reviewCount: 74,
    location: "Tech Auto Solutions",
    address: "9 Allen Avenue, Ikeja, Lagos",
    phone: "2348045678901",
    bio: "Computer-aided diagnostics expert. Using the latest OBD-II scanners and factory tools, I pinpoint your car's issues quickly and accurately before we start any repair.",
    services: ["OBD-II Scanning", "Check Engine Light", "Pre-Purchase Inspection", "ABS / Airbag Diagnostics", "Emissions Testing"],
    avatar: "https://images.pexels.com/photos/8993541/pexels-photo-8993541.jpeg",
    verified: true,
    latitude: 6.6018,
    longitude: 3.3515,
  },
  {
    id: "5",
    name: "David Wilson",
    specialty: "Brake Systems",
    experience: "9 yrs exp",
    rating: 4.7,
    reviewCount: 119,
    location: "Eastside Auto Care",
    address: "31 Oba Akran Avenue, Ikeja, Lagos",
    phone: "2348056789012",
    bio: "Safety-first brake specialist. From pad replacements to ABS module repairs, I ensure your stopping system is always in perfect condition.",
    services: ["Brake Pad Replacement", "Disc Resurfacing", "ABS Repair", "Brake Fluid Change", "Handbrake Adjustment"],
    avatar: "https://images.pexels.com/photos/8945288/pexels-photo-8945288.jpeg",
    verified: true,
    latitude: 6.6021,
    longitude: 3.3382,
  },
]

export const mockHistory: DiagnosisHistory[] = [
  {
    id: "1",
    type: "image",
    issue: "Check Engine Light",
    date: "2025-05-10",
    severity: "Medium",
    resolved: false,
  },
  {
    id: "2",
    type: "sound",
    issue: "Engine Knocking",
    date: "2025-05-05",
    severity: "High",
    resolved: false,
  },
  {
    id: "3",
    type: "image",
    issue: "Low Tire Pressure",
    date: "2025-04-28",
    severity: "Low",
    resolved: true,
  },
  {
    id: "4",
    type: "manual",
    issue: "Battery Warning",
    date: "2025-04-20",
    severity: "Medium",
    resolved: true,
  },
  {
    id: "5",
    type: "sound",
    issue: "Brake Squeaking",
    date: "2025-04-15",
    severity: "Low",
    resolved: true,
  },
]
