"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserOrganizations, getManagedProfiles } from "@/app/actions/organization"
import { getProfile } from "@/app/actions/profile"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserCircle, Briefcase, Building2, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "./user-avatar"

export function ProfileSwitcher() {
    const [organizations, setOrganizations] = useState<any[]>([])
    const [managedProfiles, setManagedProfiles] = useState<Record<string, any[]>>({})
    const [activeProfile, setActiveProfile] = useState<any>(null)
    const [selectedProfileId, setSelectedProfileId] = useState<string>("")
    const router = useRouter()

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Get current personal profile
                const persona = await getProfile()
                setActiveProfile(persona)

                // 2. Get organizations
                const orgs = await getUserOrganizations()
                setOrganizations(orgs)

                // 3. Get profiles for each organization
                const profileMap: Record<string, any[]> = {}
                for (const org of orgs) {
                    const profiles = await getManagedProfiles(org.id)
                    profileMap[org.id] = profiles
                }
                setManagedProfiles(profileMap)

                // 4. Initial value from cookie (if possible)
                const cookies = document.cookie.split('; ')
                const viewAs = cookies.find(row => row.startsWith('vlink-view-as-profile-id='))?.split('=')[1]

                if (viewAs) {
                    setSelectedProfileId(viewAs)
                } else {
                    // Try to finding the profile ID for the current personal profile username
                    // This is a bit tricky since getProfile returns limited data. 
                    // Let's just default to empty if cookie is not set.
                }
            } catch (err) {
                console.error("Error loading switcher data:", err)
            }
        }
        loadData()
    }, [])

    const handleSwitch = (profileId: string) => {
        // Set cookie
        if (profileId === "personal") {
            document.cookie = "vlink-view-as-profile-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        } else {
            document.cookie = `vlink-view-as-profile-id=${profileId}; path=/; max-age=31536000` // 1 year
        }

        setSelectedProfileId(profileId)

        // Reload to apply changes in server actions/components
        router.refresh()
        // Wait a bit for server data to sync, then push to dashboard to force state reset
        setTimeout(() => router.push("/dashboard"), 100)
    }

    if (organizations.length === 0) return null

    return (
        <div className="px-1 py-4 bg-muted/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-2 flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Viendo Agenda De:
            </p>
            <Select value={selectedProfileId || "personal"} onValueChange={handleSwitch}>
                <SelectTrigger className="w-full h-12 bg-background border-2 focus:ring-primary/20 transition-all rounded-xl pl-2">
                    <SelectValue>
                        <div className="flex items-center gap-2 truncate">
                            <UserAvatar
                                image={selectedProfileId && selectedProfileId !== "personal"
                                    ? Object.values(managedProfiles).flat().find(p => p.id === selectedProfileId)?.user?.image
                                    : activeProfile?.image}
                                name="Avatar"
                                className="h-8 w-8 rounded-lg shrink-0"
                            />
                            <span className="truncate font-bold text-sm">
                                {selectedProfileId && selectedProfileId !== "personal"
                                    ? Object.values(managedProfiles).flat().find(p => p.id === selectedProfileId)?.displayName || "Profesional"
                                    : "Mi Agenda Personal"}
                            </span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" className="rounded-xl border-2 shadow-xl">
                    <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest opacity-50">Personal</SelectLabel>
                        <SelectItem value="personal" className="py-2.5 focus:bg-primary/5 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-2">
                                <UserAvatar
                                    image={activeProfile?.image}
                                    name={activeProfile?.displayName}
                                    className="h-8 w-8 rounded-lg"
                                />
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">Mi Agenda Personal</span>
                                    <span className="text-[10px] text-muted-foreground">Propietario</span>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectGroup>

                    {organizations.map(org => {
                        const profiles = (managedProfiles[org.id] || []).filter(p => p.id !== activeProfile?.id)
                        if (profiles.length === 0) return null

                        return (
                            <SelectGroup key={org.id}>
                                <SelectLabel className="text-[10px] uppercase tracking-widest opacity-50 pt-3 flex items-center gap-2">
                                    <Building2 className="h-3 w-3" />
                                    {org.name}
                                </SelectLabel>
                                {profiles.map(profile => (
                                    <SelectItem
                                        key={profile.id}
                                        value={profile.id}
                                        className="py-2.5 focus:bg-primary/5 rounded-lg cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserAvatar
                                                image={profile.user?.image}
                                                name={profile.displayName || profile.user?.name}
                                                className="h-8 w-8 rounded-lg"
                                            />
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-sm truncate max-w-[150px]">
                                                    {profile.displayName || profile.user?.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground truncate flex flex-wrap gap-1">
                                                    <span>@{profile.username}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{profile.role?.toLowerCase() || 'Profesional'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        )
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}
