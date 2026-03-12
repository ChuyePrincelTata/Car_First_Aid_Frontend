// Types for our global mock data
export type Mechanic = {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  location: string
  avatar: string
  verified: boolean
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
    location: "Downtown Auto Shop",
    avatar: "https://images.pexels.com/photos/8993561/pexels-photo-8993561.jpeg",
    verified: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    specialty: "Electrical Systems",
    experience: "8 yrs exp",
    rating: 4.6,
    location: "Westside Garage",
    avatar: "https://images.pexels.com/photos/8993296/pexels-photo-8993296.jpeg",
    verified: true,
  },
  {
    id: "3",
    name: "Mike Robinson",
    specialty: "Transmission Expert",
    experience: "12 yrs exp",
    rating: 4.9,
    location: "Premium Auto Repairs",
    avatar: "https://images.pexels.com/photos/6692038/pexels-photo-6692038.jpeg",
    verified: true,
  },
  {
    id: "4",
    name: "Emily Chen",
    specialty: "Diagnostic Technician",
    experience: "6 yrs exp",
    rating: 4.5,
    location: "Tech Auto Solutions",
    avatar: "https://images.pexels.com/photos/8993541/pexels-photo-8993541.jpeg",
    verified: true,
  },
  {
    id: "5",
    name: "David Wilson",
    specialty: "Brake Systems",
    experience: "9 yrs exp",
    rating: 4.7,
    location: "Eastside Auto Care",
    avatar: "https://images.pexels.com/photos/8945288/pexels-photo-8945288.jpeg",
    verified: true,
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
