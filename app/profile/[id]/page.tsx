import { ImprovedProfile } from "@/components/improved-profile"
import { getAllUsers } from "@/lib/storage"
import Navigation from "@/components/navigation"
import type { Metadata } from "next"

// This is now a server component that can use generateMetadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // Fetch user data to generate dynamic metadata
    const users = await getAllUsers()
    const user = users.find((u: any) => u.id === params.id)
    
    if (!user) {
      return {
        title: "Profile Not Found - Rigeo",
        description: "The requested profile could not be found.",
      }
    }
    
    const title = `${user.displayName} (@${user.username}) - Rigeo Profile`
    const description = user.bio || `${user.displayName}'s profile on Rigeo. View their projects, badges, and achievements.`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [user.avatar || "/placeholder-avatar.png"],
        type: "profile",
      },
      twitter: {
        title,
        description,
        images: [user.avatar || "/placeholder-avatar.png"],
        card: "summary",
      },
    }
  } catch (error) {
    return {
      title: "Profile - Rigeo",
      description: "View a builder's profile on Rigeo.",
    }
  }
}

// Client component for the profile page
export default function ProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />
      <ImprovedProfile userId={params.id} />
    </div>
  )
}