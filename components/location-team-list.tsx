"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { LocationMembersConfig } from "@/components/location-members-config"

interface LocationTeamListProps {
    members: any[]
    locationId: string
    locationName: string
}

export function LocationTeamList({
    members,
    locationId,
    locationName
}: LocationTeamListProps) {
    // We use a small hack for hydration: only render the interactive Dialogs on the client
    // OR we can just rely on this being a Client Component to stabilize IDs

    return (
        <div className="space-y-2">
            {members.map((member: any) => {
                const configuredServicesCount = member.locationServices?.filter((ls: any) => ls.locationId === locationId).length || 0;
                const allServices = member.user.profile?.services || [];
                const currentServiceIds = member.locationServices
                    ?.filter((ls: any) => ls.locationId === locationId)
                    .map((s: any) => s.serviceId) || [];

                return (
                    <Dialog key={member.id}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full h-14 bg-muted/10 hover:bg-primary/5 border border-border/30 hover:border-primary/20 rounded-2xl flex items-center justify-between px-4 group/btn"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                        {member.user.name?.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-tight text-foreground">{member.user.name}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground italic">
                                            {configuredServicesCount === 0
                                                ? "Sin servicios asignados"
                                                : `${configuredServicesCount} servicio${configuredServicesCount === 1 ? '' : 's'} asignado${configuredServicesCount === 1 ? '' : 's'}`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
                            <DialogHeader className="p-8 pb-0">
                                <DialogTitle className="text-3xl font-black font-display tracking-tight uppercase">Configurar Profesional</DialogTitle>
                                <DialogDescription className="text-muted-foreground font-medium pt-2">
                                    Asigna los servicios que {member.user.name} podrá realizar en {locationName}.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-8">
                                <LocationMembersConfig
                                    memberId={member.id}
                                    memberName={member.user.name || "Miembro"}
                                    locationId={locationId}
                                    locationName={locationName}
                                    allServices={allServices}
                                    currentServiceIds={currentServiceIds}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            })}
        </div>
    )
}
