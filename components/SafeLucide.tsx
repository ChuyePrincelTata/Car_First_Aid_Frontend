import React from "react"
import * as Lucide from "lucide-react-native"

type IconProps = {
  color?: string
  size?: number
  strokeWidth?: number
  [key: string]: any
}

const makeSafe = (Icon: any) => {
  const isValid =
    typeof Icon === "function" || (typeof Icon === "object" && Icon !== null && "$$typeof" in Icon)
  return function SafeIcon(props: IconProps) {
    if (!Icon || !isValid) return null
    return <Icon {...props} />
  }
}

export const AlertCircle = makeSafe(Lucide.AlertCircle)
export const AlertTriangle = makeSafe(Lucide.AlertTriangle)
export const Bell = makeSafe(Lucide.Bell)
export const Calendar = makeSafe(Lucide.Calendar)
export const Camera = makeSafe(Lucide.Camera)
export const CheckCircle = makeSafe(Lucide.CheckCircle)
export const ChevronRight = makeSafe(Lucide.ChevronRight)
export const ChevronLeft = makeSafe(Lucide.ChevronLeft)
export const FileText = makeSafe(Lucide.FileText)
export const ExternalLink = makeSafe(Lucide.ExternalLink)
export const Eye = makeSafe(Lucide.Eye)
export const EyeOff = makeSafe(Lucide.EyeOff)
export const HelpCircle = makeSafe(Lucide.HelpCircle)
export const History = makeSafe(Lucide.History)
export const HistoryIcon = makeSafe(Lucide.History)
export const Home = makeSafe(Lucide.Home)
export const Info = makeSafe(Lucide.Info)
export const Lock = makeSafe(Lucide.Lock)
export const LogOut = makeSafe(Lucide.LogOut)
export const Mail = makeSafe(Lucide.Mail)
export const MapPin = makeSafe(Lucide.MapPin)
export const MessageCircle = makeSafe(Lucide.MessageCircle)
export const MessageSquare = makeSafe(Lucide.MessageSquare)
export const Mic = makeSafe(Lucide.Mic)
export const Moon = makeSafe(Lucide.Moon)
export const Pause = makeSafe(Lucide.Pause)
export const Phone = makeSafe(Lucide.Phone)
export const Play = makeSafe(Lucide.Play)
export const Search = makeSafe(Lucide.Search)
export const Settings = makeSafe(Lucide.Settings)
export const Share2 = makeSafe(Lucide.Share2)
export const Shield = makeSafe(Lucide.Shield)
export const Star = makeSafe(Lucide.Star)
export const StopCircle = makeSafe(Lucide.StopCircle)
export const Sun = makeSafe(Lucide.Sun)
export const ThumbsDown = makeSafe(Lucide.ThumbsDown)
export const ThumbsUp = makeSafe(Lucide.ThumbsUp)
export const TriangleAlert = makeSafe(Lucide.TriangleAlert)
export const Upload = makeSafe(Lucide.Upload)
export const User = makeSafe(Lucide.User)
export const UserIcon = makeSafe(Lucide.User)
export const Wrench = makeSafe(Lucide.Wrench)
export const X = makeSafe(Lucide.X)
