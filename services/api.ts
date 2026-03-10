// Auth API
export const loginUser = async (email: string, password: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would make a POST request to your authentication endpoint
  if (email && password) {
    return {
      id: "123",
      email,
      name: "John Doe",
      token: "mock-jwt-token",
    }
  }

  throw new Error("Invalid credentials")
}

export const registerUser = async (email: string, password: string, name: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would make a POST request to your registration endpoint
  if (email && password && name) {
    return {
      id: "123",
      email,
      name,
      token: "mock-jwt-token",
    }
  }

  throw new Error("Registration failed")
}

// Diagnostics API
interface VideoLink {
  title: string
  url: string
}

interface DiagnosticResult {
  issue: string
  confidence: number
  description: string
  recommendation: string
  severity: "low" | "medium" | "high"
  videoLinks: VideoLink[]
}

interface DiagnosticResponse {
  id: string
  type: "engine" | "dashboard"
  title: string
  date: string
  status: "pending" | "completed" | "failed"
  result: DiagnosticResult
}

export const uploadEngineSoundRecording = async (audioFile: File): Promise<DiagnosticResponse> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // In a real app, this would upload the audio file to your server
  // and then call the Python Flask API for analysis
  return {
    id: Math.floor(Math.random() * 1000).toString(),
    type: "engine",
    title: "Engine Sound Analysis",
    date: new Date().toISOString(),
    status: "completed",
    result: {
      issue: "Irregular engine idle",
      confidence: 87,
      description:
        "The audio analysis detected an irregular engine idle pattern which could indicate issues with the fuel injectors or spark plugs.",
      recommendation: "Check and possibly replace spark plugs. Inspect fuel injectors for clogs.",
      severity: "medium",
      videoLinks: [
        {
          title: "How to Fix Engine Idle Problems",
          url: "https://www.youtube.com/watch?v=example1",
        },
        {
          title: "Diagnosing Irregular Idle Issues",
          url: "https://www.youtube.com/watch?v=example2",
        },
      ],
    },
  }
}

interface UploadDashboardImageResponse extends DiagnosticResponse {
  // extends the existing DiagnosticResponse interface
}

export const uploadDashboardImage = async (imageFile: File): Promise<UploadDashboardImageResponse> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // In a real app, this would upload the image file to your server
  // and then call the Python Flask API for analysis
  return {
    id: Math.floor(Math.random() * 1000).toString(),
    type: "dashboard",
    title: "Dashboard Light Analysis",
    date: new Date().toISOString(),
    status: "completed",
    result: {
      issue: "ABS Warning Light",
      confidence: 93,
      description:
        "The Anti-lock Braking System (ABS) warning light indicates a potential issue with your vehicle's ABS. This system prevents your wheels from locking up during hard braking.",
      recommendation:
        "Have your ABS system checked by a professional mechanic. Continue to drive with caution, as your normal brakes should still work, but the anti-lock function may be compromised.",
      severity: "medium",
      videoLinks: [
        {
          title: "Understanding ABS Warning Light",
          url: "https://www.youtube.com/watch?v=example1",
        },
        {
          title: "Common ABS System Problems",
          url: "https://www.youtube.com/watch?v=example2",
        },
      ],
    },
  }
}

export const fetchDiagnosticHistory = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would retrieve the user's diagnostic history from your server
  return [
    {
      id: "1",
      type: "engine",
      title: "Engine Sound Analysis",
      date: "2023-09-15T14:48:00.000Z",
      status: "completed",
      result: {
        issue: "Timing Belt Noise",
        confidence: 92,
        description:
          "The audio analysis detected sounds consistent with a worn timing belt or tensioner. This can lead to engine performance issues if not addressed.",
        recommendation:
          "Have your timing belt and tensioner inspected and replaced if necessary. This is a critical maintenance item.",
        severity: "medium",
        videoLinks: [
          {
            title: "How to Diagnose Timing Belt Noise",
            url: "https://www.youtube.com/watch?v=example1",
          },
        ],
      },
    },
    {
      id: "2",
      type: "dashboard",
      title: "Dashboard Light Check",
      date: "2023-09-10T10:30:00.000Z",
      status: "completed",
      result: {
        issue: "Check Engine Light",
        confidence: 98,
        description:
          "The check engine light indicates an issue with your engine or emissions system that needs attention.",
        recommendation:
          "Connect an OBD-II scanner to retrieve the specific error code. Common causes include oxygen sensor failure, loose gas cap, or catalytic converter issues.",
        severity: "medium",
        videoLinks: [
          {
            title: "Understanding Check Engine Light",
            url: "https://www.youtube.com/watch?v=example2",
          },
        ],
      },
    },
  ]
}

// Mechanics API
export const fetchMechanics = async (query = "") => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would retrieve mechanics from your server based on location/search
  const mechanics = [
    {
      id: "1",
      name: "John's Auto Repair",
      rating: 4.8,
      reviewCount: 156,
      specialty: "General Repairs, Engine Diagnostics",
      distance: 2.3,
      imageUri:
        "https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      location: "Downtown, New York",
      isOpen: true,
      certified: true,
    },
    {
      id: "2",
      name: "Quick Fix Auto Shop",
      rating: 4.5,
      reviewCount: 98,
      specialty: "Brakes, Electrical Systems",
      distance: 3.7,
      imageUri:
        "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      location: "Brooklyn, New York",
      isOpen: true,
      certified: true,
    },
    {
      id: "3",
      name: "Premium Auto Service",
      rating: 4.9,
      reviewCount: 212,
      specialty: "Luxury Vehicles, Diagnostics",
      distance: 5.1,
      imageUri:
        "https://images.pexels.com/photos/3846205/pexels-photo-3846205.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      location: "Manhattan, New York",
      isOpen: false,
      certified: true,
    },
    {
      id: "4",
      name: "City Mechanics",
      rating: 4.2,
      reviewCount: 67,
      specialty: "Engine Repair, Transmission",
      distance: 1.8,
      imageUri:
        "https://images.pexels.com/photos/4489731/pexels-photo-4489731.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      location: "Queens, New York",
      isOpen: true,
      certified: false,
    },
  ]

  if (!query) return mechanics

  return mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(query.toLowerCase()) ||
      mechanic.specialty.toLowerCase().includes(query.toLowerCase()) ||
      mechanic.location.toLowerCase().includes(query.toLowerCase()),
  )
}

export const fetchMechanicDetails = async (id: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would retrieve a specific mechanic's details from your server
  return {
    id,
    name: "John's Auto Repair",
    rating: 4.8,
    reviewCount: 156,
    specialty: "General Repairs, Engine Diagnostics",
    distance: 2.3,
    imageUri:
      "https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    location: "123 Main St, Downtown, New York",
    description:
      "John's Auto Repair specializes in comprehensive engine diagnostics and repairs. With over 15 years of experience, our certified mechanics can solve even the most complex automotive issues.",
    isOpen: true,
    certified: true,
    hours: [
      { day: "Monday", hours: "8:00 AM - 6:00 PM" },
      { day: "Tuesday", hours: "8:00 AM - 6:00 PM" },
      { day: "Wednesday", hours: "8:00 AM - 6:00 PM" },
      { day: "Thursday", hours: "8:00 AM - 6:00 PM" },
      { day: "Friday", hours: "8:00 AM - 6:00 PM" },
      { day: "Saturday", hours: "9:00 AM - 4:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    phone: "+1 (555) 123-4567",
    email: "service@johnsauto.example.com",
    services: [
      "Engine Diagnostics & Repair",
      "Brake System Service",
      "Transmission Repair",
      "Electrical System Diagnosis",
      "AC System Service",
      "Scheduled Maintenance",
    ],
    reviews: [
      {
        id: "1",
        user: "Michael S.",
        rating: 5,
        date: "2023-05-15",
        comment: "Great service! They diagnosed my engine issue quickly and fixed it the same day.",
        helpful: 12,
        unhelpful: 1,
      },
      {
        id: "2",
        user: "Sarah T.",
        rating: 4,
        date: "2023-04-22",
        comment: "Very professional and honest about the repairs needed. Price was fair and service was quick.",
        helpful: 8,
        unhelpful: 0,
      },
      {
        id: "3",
        user: "David K.",
        rating: 5,
        date: "2023-03-10",
        comment: "John fixed my ABS warning light issue. Great communication throughout the process and fair pricing.",
        helpful: 5,
        unhelpful: 0,
      },
    ],
  }
}
