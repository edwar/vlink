"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserOrganizations, getManagedProfiles } from "@/app/actions/organization"
import { getProfile } from "@/app/actions/profile"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { useProfileStore } from "@/lib/store/profile-store"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSwitcher({ onClick }: { onClick?: () => void }) {
    const [organizations, setOrganizations] = useState<any[]>([])
    const [managedProfiles, setManagedProfiles] = useState<Record<string, any[]>>({})
    const [activeProfile, setActiveProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const { viewAsProfileId: selectedProfileId, setViewAsProfileId } = useProfileStore()
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
            } catch (err) {
                console.error("Error loading switcher data:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const handleSwitch = (profileId: string) => {
        onClick?.()
        setViewAsProfileId(profileId)

        // Reload to apply changes in server actions/components
        router.refresh()
        // Force navigate to dashboard to ensure all server data is re-fetched with the new cookie
        router.push("/dashboard")
    }

    if (isLoading) {
        return (
            <div className="py-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-full h-12 rounded-xl" />
            </div>
        )
    }

    if (organizations.length === 0 || organizations.reduce((acc, org) => acc + (managedProfiles[org.id]?.length || 0), 0) === 0) {
        return (
            <div className="py-4 bg-muted/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-2 flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Viendo Agenda De:
                </p>
                <div className="flex items-center gap-2 h-12 bg-background border-2 border-primary/5 rounded-sm px-2 shadow-sm">
                    <UserAvatar
                        image={activeProfile?.image}
                        name={activeProfile?.displayName || "Mi Agenda"}
                        className="h-8 w-8 rounded-lg shrink-0"
                    />
                    <span className="truncate font-bold text-sm">Mi Agenda Personal</span>
                </div>
            </div>
        )
    }

    return (
        <div className="py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 px-2 flex items-center gap-2">
                <Building2 className="h-3 w-3" />
                Viendo Agenda De:
            </p>
            <Select value={selectedProfileId || "personal"} onValueChange={handleSwitch}>
                <SelectTrigger className="w-full h-12 bg-background border-2 focus:ring-primary/20 transition-all rounded-sm pl-2">
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
                <SelectContent position="popper" side="bottom" align="start" className="w-(--radix-select-trigger-width) rounded-sm border shadow-xl">
                    <SelectGroup>
                        <SelectLabel className="text-[10px] uppercase tracking-widest opacity-50">Personal</SelectLabel>
                        <SelectItem value="personal" className="py-2.5 ring-0 ring-offset-0 cursor-pointer rounded-[6px] focus:bg-accent/50">
                            <div className="flex items-center gap-2">
                                <UserAvatar
                                    image={activeProfile?.image}
                                    name={activeProfile?.displayName}
                                    className="h-8 w-8 rounded-lg shrink-0"
                                />
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm truncate max-w-[130px]">Mi Agenda Personal</span>
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
                                        className="py-2.5 ring-0 ring-offset-0 cursor-pointer rounded-[6px] focus:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserAvatar
                                                image={profile.user?.image}
                                                name={profile.displayName || profile.user?.name}
                                                className="h-8 w-8 rounded-lg shrink-0"
                                            />
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-sm truncate max-w-[130px]">
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
